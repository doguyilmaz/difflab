<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Comparison History</h1>
          <p class="text-gray-600">
            View and manage your previous JSON comparisons.
          </p>
        </div>
        <button
          v-if="history.length > 0"
          @click="historyStore.clearHistory"
          class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <TrashIcon class="h-4 w-4" />
          Clear All
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="history.length === 0" class="text-center py-16">
        <ClockIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No comparison history</h3>
        <p class="text-gray-600 mb-6">
          Your comparison history will appear here after you start comparing JSON files.
        </p>
        <router-link to="/compare" class="btn-primary">
          <DocumentDuplicateIcon class="h-4 w-4" />
          Start Comparing
        </router-link>
      </div>

      <!-- History List -->
      <div v-else class="space-y-4">
        <!-- Filters -->
        <div class="card p-4">
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by filename..."
                class="input-field"
              >
            </div>
            <div class="flex gap-2">
              <select v-model="filterMode" class="input-field">
                <option value="">All modes</option>
                <option value="key">Key Comparison</option>
                <option value="diff">Diff Comparison</option>
              </select>
              <select v-model="sortBy" class="input-field">
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="name">By filename</option>
              </select>
            </div>
          </div>
        </div>

        <!-- History Items -->
        <div class="space-y-3">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="card p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex items-center text-sm text-gray-500">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(item.timestamp) }}
                  </div>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="item.mode === 'key' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                  >
                    {{ item.mode === 'key' ? 'Key Comparison' : 'Diff Comparison' }}
                  </span>
                  <span
                    v-if="item.hasChanges"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {{ item.changesCount }} difference(s)
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    No differences
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div class="flex items-center text-sm text-gray-700">
                    <DocumentTextIcon class="h-4 w-4 mr-2 text-blue-500" />
                    <span class="font-medium">{{ item.files.first }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-700">
                    <DocumentTextIcon class="h-4 w-4 mr-2 text-green-500" />
                    <span class="font-medium">{{ item.files.second }}</span>
                  </div>
                </div>

                <!-- Summary -->
                <div v-if="item.summary" class="text-sm text-gray-600 mb-3">
                  {{ item.summary }}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="loadComparison(item)"
                  class="btn-secondary text-xs"
                  title="Load this comparison"
                >
                  <ArrowPathIcon class="h-4 w-4" />
                  Load
                </button>
                <button
                  @click="exportComparison(item)"
                  class="btn-secondary text-xs"
                  title="Export results"
                >
                  <ArrowDownTrayIcon class="h-4 w-4" />
                </button>
                <button
                  @click="deleteItem(item.id)"
                  class="text-red-500 hover:text-red-700 p-1"
                  title="Delete this comparison"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <nav class="flex items-center gap-2">
            <button
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJsonDiffStore } from '@/stores/counter'
import { useHistoryStore, type HistoryItem } from '@/stores/history'
import AppLayout from '@/components/AppLayout.vue'
import {
  ClockIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'


const router = useRouter()
const store = useJsonDiffStore()
const historyStore = useHistoryStore()

const history = computed(() => historyStore.history)
const searchQuery = ref('')
const filterMode = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredHistory = computed(() => {
  let filtered = searchQuery.value 
    ? historyStore.searchHistory(searchQuery.value)
    : history.value

  // Mode filter
  if (filterMode.value) {
    filtered = historyStore.filterByMode(filterMode.value as 'key' | 'diff' | '')
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'date-asc':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case 'name':
        return a.files.first.localeCompare(b.files.first)
      default:
        return 0
    }
  })

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = searchQuery.value 
    ? historyStore.searchHistory(searchQuery.value)
    : history.value

  if (filterMode.value) {
    filtered = historyStore.filterByMode(filterMode.value as 'key' | 'diff' | '')
  }

  return Math.ceil(filtered.length / itemsPerPage)
})


function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function loadComparison(item: HistoryItem) {
  // Load the comparison data into the store
  store.updateJsonFile('json1', {
    content: item.data.json1Content,
    name: item.files.first,
    isValid: true,
    isEdited: false
  })

  store.updateJsonFile('json2', {
    content: item.data.json2Content,
    name: item.files.second,
    isValid: true,
    isEdited: false
  })

  store.comparisonMode = item.mode
  store.setComparisonResult(item.data.result)

  // Navigate to comparison view
  router.push(`/compare/${item.mode}`)
}

function exportComparison(item: HistoryItem) {
  historyStore.exportItem(item)
}

function deleteItem(id: string) {
  const confirmed = confirm('Are you sure you want to delete this comparison?')
  if (confirmed) {
    historyStore.removeItem(id)
  }
}


</script>