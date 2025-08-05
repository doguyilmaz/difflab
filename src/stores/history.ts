import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export interface HistoryItem {
  id: string
  timestamp: string
  mode: 'key' | 'diff'
  files: {
    first: string
    second: string
  }
  hasChanges: boolean
  changesCount: number
  summary: string
  data: {
    json1Content: string
    json2Content: string
    result: any
    compareValues: boolean
  }
}

export const useHistoryStore = defineStore('history', () => {
  const settingsStore = useSettingsStore()
  const history = ref<HistoryItem[]>([])

  // Load history from localStorage
  function loadHistory() {
    if (!settingsStore.settings.saveHistory) return
    
    const saved = localStorage.getItem('json-diff-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as HistoryItem[]
        // Filter out expired items
        const retentionDays = settingsStore.settings.historyRetention
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
        
        history.value = parsed.filter(item => 
          new Date(item.timestamp) > cutoffDate
        )
        
        // Save cleaned history back
        saveHistory()
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
  }

  // Save history to localStorage
  function saveHistory() {
    if (!settingsStore.settings.saveHistory) return
    
    try {
      localStorage.setItem('json-diff-history', JSON.stringify(history.value))
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  // Add new comparison to history
  function addToHistory(
    mode: 'key' | 'diff',
    json1: { name: string; content: string },
    json2: { name: string; content: string },
    result: any,
    compareValues: boolean
  ) {
    if (!settingsStore.settings.saveHistory) return

    const changesCount = calculateChangesCount(result, mode)
    const hasChanges = changesCount > 0
    
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mode,
      files: {
        first: json1.name.replace(' (edited)', ''),
        second: json2.name.replace(' (edited)', '')
      },
      hasChanges,
      changesCount,
      summary: generateSummary(result, mode, changesCount),
      data: {
        json1Content: json1.content,
        json2Content: json2.content,
        result,
        compareValues
      }
    }

    // Add to beginning of history
    history.value.unshift(item)
    
    // Keep only recent items (max 100)
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
    
    saveHistory()
  }

  // Calculate number of changes
  function calculateChangesCount(result: any, mode: 'key' | 'diff'): number {
    if (!result) return 0
    
    if (mode === 'key') {
      const missing1 = Object.keys(result.missingInFirst || {}).length
      const missing2 = Object.keys(result.missingInSecond || {}).length
      return missing1 + missing2
    } else {
      // Count changes in diff HTML
      const diffHtml = result.diffHtml || ''
      const addedCount = (diffHtml.match(/text-green-600/g) || []).length
      const removedCount = (diffHtml.match(/text-red-600/g) || []).length
      const changedCount = (diffHtml.match(/text-orange-600/g) || []).length
      return addedCount + removedCount + changedCount
    }
  }

  // Generate summary text
  function generateSummary(result: any, mode: 'key' | 'diff', changesCount: number): string {
    if (changesCount === 0) {
      return 'No differences found'
    }
    
    if (mode === 'key') {
      const missing1 = Object.keys(result.missingInFirst || {}).length
      const missing2 = Object.keys(result.missingInSecond || {}).length
      
      const parts = []
      if (missing1 > 0) parts.push(`${missing1} missing in first`)
      if (missing2 > 0) parts.push(`${missing2} missing in second`)
      
      return parts.join(', ')
    } else {
      return `${changesCount} differences found`
    }
  }

  // Remove item from history
  function removeItem(id: string) {
    history.value = history.value.filter(item => item.id !== id)
    saveHistory()
  }

  // Clear all history
  function clearHistory() {
    history.value = []
    localStorage.removeItem('json-diff-history')
  }

  // Search history
  function searchHistory(query: string) {
    if (!query.trim()) return history.value
    
    const lowerQuery = query.toLowerCase()
    return history.value.filter(item =>
      item.files.first.toLowerCase().includes(lowerQuery) ||
      item.files.second.toLowerCase().includes(lowerQuery) ||
      item.summary.toLowerCase().includes(lowerQuery)
    )
  }

  // Filter by mode
  function filterByMode(mode: 'key' | 'diff' | '') {
    if (!mode) return history.value
    return history.value.filter(item => item.mode === mode)
  }

  // Export history item
  function exportItem(item: HistoryItem) {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comparison-${item.files.first}-vs-${item.files.second}-${item.timestamp.split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    history: computed(() => history.value),
    loadHistory,
    addToHistory,
    removeItem,
    clearHistory,
    searchHistory,
    filterByMode,
    exportItem
  }
})