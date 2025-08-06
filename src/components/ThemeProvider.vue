<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

// Apply theme to document
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Watch for theme changes from settings
watch(() => settingsStore.settings.theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

// Apply theme on mount
onMounted(() => {
  applyTheme(settingsStore.settings.theme)
})
</script>