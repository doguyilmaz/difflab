<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">
          Customize your JSON Diff Tool experience with these preferences.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Comparison Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CogIcon class="h-5 w-5 mr-2" />
            Comparison Settings
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Default Compare Values</label>
                <p class="text-sm text-gray-500">Always compare values by default when loading the app</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  :checked="settingsStore.settings.defaultCompareValues"
                  type="checkbox"
                  class="sr-only peer"
                  @change="settingsStore.updateSetting('defaultCompareValues', ($event.target as HTMLInputElement).checked)"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Auto-format JSON</label>
                <p class="text-sm text-gray-500">Automatically format JSON when pasting</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  :checked="settingsStore.settings.autoFormatJson"
                  type="checkbox"
                  class="sr-only peer"
                  @change="settingsStore.updateSetting('autoFormatJson', ($event.target as HTMLInputElement).checked)"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Default Comparison Mode</label>
              <select
                :value="settingsStore.settings.defaultComparisonMode"
                class="input-field max-w-xs"
                @change="settingsStore.updateSetting('defaultComparisonMode', ($event.target as HTMLSelectElement).value as 'key' | 'diff')"
              >
                <option value="key">Key Comparison</option>
                <option value="diff">Diff Comparison</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PaintBrushIcon class="h-5 w-5 mr-2" />
            Appearance
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Theme</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    :checked="settingsStore.settings.theme === 'light'"
                    type="radio"
                    value="light"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    @change="settingsStore.updateSetting('theme', 'light')"
                  >
                  <span class="ml-2 text-sm text-gray-700">Light</span>
                </label>
                <label class="flex items-center">
                  <input
                    :checked="settingsStore.settings.theme === 'dark'"
                    type="radio"
                    value="dark"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    @change="settingsStore.updateSetting('theme', 'dark')"
                  >
                  <span class="ml-2 text-sm text-gray-700">Dark</span>
                </label>
                <label class="flex items-center">
                  <input
                    :checked="settingsStore.settings.theme === 'system'"
                    type="radio"
                    value="system"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    @change="settingsStore.updateSetting('theme', 'system')"
                  >
                  <span class="ml-2 text-sm text-gray-700">System</span>
                </label>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Font Size</label>
              <select
                :value="settingsStore.settings.fontSize"
                class="input-field max-w-xs"
                @change="settingsStore.updateSetting('fontSize', ($event.target as HTMLSelectElement).value as 'small' | 'medium' | 'large')"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Privacy & Data Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon class="h-5 w-5 mr-2" />
            Privacy & Data
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Save Comparison History</label>
                <p class="text-sm text-gray-500">Store your comparison history locally in browser</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  :checked="settingsStore.settings.saveHistory"
                  type="checkbox"
                  class="sr-only peer"
                  @change="settingsStore.updateSetting('saveHistory', ($event.target as HTMLInputElement).checked)"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">History Retention</label>
              <select
                :value="settingsStore.settings.historyRetention"
                class="input-field max-w-xs"
                :disabled="!settingsStore.settings.saveHistory"
                @change="settingsStore.updateSetting('historyRetention', parseInt(($event.target as HTMLSelectElement).value))"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button
                @click="clearAllData"
                class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon class="h-4 w-4" />
                Clear All Data
              </button>
              <p class="text-xs text-gray-500 mt-2">
                This will clear all settings, history, and cached data
              </p>
            </div>
          </div>
        </div>

        <!-- Export/Import Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowsRightLeftIcon class="h-5 w-5 mr-2" />
            Backup & Restore
          </h2>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <button
                @click="settingsStore.exportSettings"
                class="btn-secondary"
              >
                <ArrowDownTrayIcon class="h-4 w-4" />
                Export Settings
              </button>
              
              <label class="btn-secondary cursor-pointer">
                <ArrowUpTrayIcon class="h-4 w-4" />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  class="hidden"
                  @change="importSettings"
                >
              </label>
            </div>
            <p class="text-sm text-gray-500">
              Export your settings to backup or share with other devices
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useSettingsStore } from '@/stores/settings'
import { useHistoryStore } from '@/stores/history'
import {
  CogIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const importFileRef = ref<HTMLInputElement>()

function clearAllData() {
  const confirmed = confirm(
    'This will permanently delete all your settings, history, and cached data. Are you sure?'
  )
  
  if (confirmed) {
    localStorage.clear()
    settingsStore.resetSettings()
    historyStore.clearHistory()
    alert('All data has been cleared successfully.')
  }
}

async function importSettings(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    await settingsStore.importSettings(file)
    alert('Settings imported successfully!')
  } catch (error) {
    alert(`Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Reset input
  ;(event.target as HTMLInputElement).value = ''
}
</script>