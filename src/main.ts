import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores after Pinia is ready
import { useSettingsStore } from './stores/settings'
import { useHistoryStore } from './stores/history'
import { useJsonDiffStore } from './stores/counter'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const jsonDiffStore = useJsonDiffStore()

// Load data from storage
settingsStore.loadSettings()
historyStore.loadHistory()
jsonDiffStore.initializeFromSettings()

app.mount('#app')
