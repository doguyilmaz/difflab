<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p class="text-muted-foreground">
          Customize your JSON Diff Tool experience with these preferences.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Comparison Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <CogIcon class="h-5 w-5 mr-2" />
              Comparison Settings
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <label class="text-sm font-medium">Default Compare Values</label>
                <p class="text-sm text-muted-foreground">Always compare values by default when loading the app</p>
              </div>
              <Switch
                :checked="settingsStore.settings.defaultCompareValues"
                @update:checked="(checked) => settingsStore.updateSetting('defaultCompareValues', checked)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <label class="text-sm font-medium">Auto-format JSON</label>
                <p class="text-sm text-muted-foreground">Automatically format JSON when pasting</p>
              </div>
              <Switch
                :checked="settingsStore.settings.autoFormatJson"
                @update:checked="(checked) => settingsStore.updateSetting('autoFormatJson', checked)"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Default Comparison Mode</label>
              <Select
                :model-value="settingsStore.settings.defaultComparisonMode"
                @update:model-value="(value) => settingsStore.updateSetting('defaultComparisonMode', value as 'key' | 'diff')"
              >
                <SelectTrigger class="max-w-xs">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key">Key Comparison</SelectItem>
                  <SelectItem value="diff">Diff Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Appearance Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <PaintBrushIcon class="h-5 w-5 mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-3">
              <Label class="text-sm font-medium">Theme</Label>
              <RadioGroup
                :model-value="settingsStore.settings.theme"
                @update:model-value="(value) => settingsStore.updateSetting('theme', value as 'light' | 'dark' | 'system')"
                class="flex gap-6"
              >
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System</Label>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Font Size</Label>
              <Select
                :model-value="settingsStore.settings.fontSize"
                @update:model-value="(value) => settingsStore.updateSetting('fontSize', value as 'small' | 'medium' | 'large')"
              >
                <SelectTrigger class="max-w-xs">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Privacy & Data Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <ShieldCheckIcon class="h-5 w-5 mr-2" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-sm font-medium">Save Comparison History</Label>
                <p class="text-sm text-muted-foreground">Store your comparison history locally in browser</p>
              </div>
              <Switch
                :checked="settingsStore.settings.saveHistory"
                @update:checked="(checked) => settingsStore.updateSetting('saveHistory', checked)"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">History Retention</Label>
              <Select
                :model-value="settingsStore.settings.historyRetention.toString()"
                :disabled="!settingsStore.settings.saveHistory"
                @update:model-value="(value) => settingsStore.updateSetting('historyRetention', parseInt(value))"
              >
                <SelectTrigger class="max-w-xs">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="pt-4 border-t border-border">
              <Button
                @click="clearAllData"
                variant="outline"
                class="text-destructive hover:text-destructive"
              >
                <TrashIcon class="h-4 w-4" />
                Clear All Data
              </Button>
              <p class="text-xs text-muted-foreground mt-2">
                This will clear all settings, history, and cached data
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Export/Import Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <ArrowsRightLeftIcon class="h-5 w-5 mr-2" />
              Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-4">
              <Button
                @click="settingsStore.exportSettings"
                variant="outline"
              >
                <ArrowDownTrayIcon class="h-4 w-4" />
                Export Settings
              </Button>
              
              <Button variant="outline" class="relative">
                <ArrowUpTrayIcon class="h-4 w-4" />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  @change="importSettings"
                >
              </Button>
            </div>
            <p class="text-sm text-muted-foreground">
              Export your settings to backup or share with other devices
            </p>
          </CardContent>
        </Card>
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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