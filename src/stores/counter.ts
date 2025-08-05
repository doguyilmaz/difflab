import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'
import { useHistoryStore } from './history'

export interface JsonFile {
  id: string
  name: string
  content: string
  isValid: boolean
  error?: string
  isEdited: boolean
}

export interface ComparisonResult {
  missingInFirst: Record<string, any>
  missingInSecond: Record<string, any>
  diffHtml: string
  hasChanges: boolean
}

export const useJsonDiffStore = defineStore('jsonDiff', () => {
  const settingsStore = useSettingsStore()
  const historyStore = useHistoryStore()

  const json1 = ref<JsonFile>({
    id: 'json1',
    name: 'JSON 1',
    content: '',
    isValid: true,
    isEdited: false
  })

  const json2 = ref<JsonFile>({
    id: 'json2', 
    name: 'JSON 2',
    content: '',
    isValid: true,
    isEdited: false
  })

  const comparisonMode = ref<'key' | 'diff'>(settingsStore.settings.defaultComparisonMode)
  const compareValues = ref(settingsStore.settings.defaultCompareValues)
  const comparisonResult = ref<ComparisonResult | null>(null)

  const hasJsonFiles = computed(() => 
    json1.value.content.trim() !== '' && json2.value.content.trim() !== ''
  )

  const bothValid = computed(() =>
    json1.value.isValid && json2.value.isValid && hasJsonFiles.value
  )

  function updateJsonFile(id: 'json1' | 'json2', updates: Partial<JsonFile>) {
    const target = id === 'json1' ? json1.value : json2.value
    Object.assign(target, updates)
  }

  function clearJsonFile(id: 'json1' | 'json2') {
    const defaultName = id === 'json1' ? 'JSON 1' : 'JSON 2'
    updateJsonFile(id, {
      name: defaultName,
      content: '',
      isValid: true,
      error: undefined,
      isEdited: false
    })
  }

  function setComparisonResult(result: ComparisonResult) {
    comparisonResult.value = result
    
    // Add to history if both JSONs are present
    if (hasJsonFiles.value && bothValid.value) {
      historyStore.addToHistory(
        comparisonMode.value,
        { name: json1.value.name, content: json1.value.content },
        { name: json2.value.name, content: json2.value.content },
        result,
        compareValues.value
      )
    }
  }

  function resetComparison() {
    comparisonResult.value = null
  }

  // Initialize settings when store is created
  function initializeFromSettings() {
    comparisonMode.value = settingsStore.settings.defaultComparisonMode
    compareValues.value = settingsStore.settings.defaultCompareValues
  }

  // Watch settings changes
  watch(() => settingsStore.settings.defaultComparisonMode, (newMode) => {
    if (!comparisonResult.value) {
      comparisonMode.value = newMode
    }
  })

  watch(() => settingsStore.settings.defaultCompareValues, (newValue) => {
    if (!comparisonResult.value) {
      compareValues.value = newValue
    }
  })

  return {
    json1,
    json2,
    comparisonMode,
    compareValues,
    comparisonResult,
    hasJsonFiles,
    bothValid,
    updateJsonFile,
    clearJsonFile,
    setComparisonResult,
    resetComparison,
    initializeFromSettings
  }
})
