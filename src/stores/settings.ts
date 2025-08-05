import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface AppSettings {
  defaultCompareValues: boolean
  autoFormatJson: boolean
  defaultComparisonMode: 'key' | 'diff'
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  saveHistory: boolean
  historyRetention: number
}

const defaultSettings: AppSettings = {
  defaultCompareValues: false,
  autoFormatJson: true,
  defaultComparisonMode: 'key',
  theme: 'system',
  fontSize: 'medium',
  saveHistory: true,
  historyRetention: 30
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...defaultSettings })
  
  // Load settings from localStorage
  function loadSettings() {
    const saved = localStorage.getItem('json-diff-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AppSettings>
        settings.value = { ...defaultSettings, ...parsed }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem('json-diff-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // Update a specific setting
  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    settings.value[key] = value
    saveSettings()
  }

  // Reset to defaults
  function resetSettings() {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  // Export settings
  function exportSettings() {
    const data = {
      settings: settings.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `json-diff-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import settings
  function importSettings(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.settings) {
            settings.value = { ...defaultSettings, ...data.settings }
            saveSettings()
            resolve()
          } else {
            reject(new Error('Invalid settings file format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Apply theme
  const currentTheme = computed(() => {
    if (settings.value.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.value.theme
  })

  // Apply font size
  const fontSizeClass = computed(() => {
    switch (settings.value.fontSize) {
      case 'small': return 'text-sm'
      case 'large': return 'text-lg'
      default: return 'text-base'
    }
  })

  // Watch for theme changes and apply to document
  watch(currentTheme, (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  // Auto-save when settings change
  watch(settings, saveSettings, { deep: true })

  return {
    settings: computed(() => settings.value),
    currentTheme,
    fontSizeClass,
    loadSettings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings
  }
})