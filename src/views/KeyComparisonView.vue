<template>
  <div class="card p-6">
    <h2 class="text-xl font-semibold mb-6 flex items-center">
      <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
      Key Differences
    </h2>

    <div v-if="!store.hasJsonFiles" class="text-center py-12">
      <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Provide both JSON inputs to compare keys.</p>
    </div>

    <div v-else-if="!store.bothValid" class="text-center py-12">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto mb-4" />
      <p class="text-red-600">Please ensure both JSON inputs are valid.</p>
    </div>

    <div v-else-if="isComparing" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Comparing JSON structures...</p>
    </div>

    <div v-else-if="store.comparisonResult" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Missing in First JSON -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MinusCircleIcon class="h-4 w-4 text-red-500 mr-2" />
          Missing in <span class="font-semibold text-gray-900 ml-1">{{ cleanFileName(store.json1.name) }}</span>:
        </h3>
        <div class="bg-gray-50 rounded-lg border min-h-[200px] max-h-[400px] overflow-auto">
          <pre
            v-if="Object.keys(store.comparisonResult.missingInFirst).length > 0"
            class="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono"
          >{{ JSON.stringify(store.comparisonResult.missingInFirst, null, 2) }}</pre>
          <div v-else class="p-4 text-center text-gray-500 italic">
            No missing keys found
          </div>
        </div>
      </div>

      <!-- Missing in Second JSON -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MinusCircleIcon class="h-4 w-4 text-red-500 mr-2" />
          Missing in <span class="font-semibold text-gray-900 ml-1">{{ cleanFileName(store.json2.name) }}</span>:
        </h3>
        <div class="bg-gray-50 rounded-lg border min-h-[200px] max-h-[400px] overflow-auto">
          <pre
            v-if="Object.keys(store.comparisonResult.missingInSecond).length > 0"
            class="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono"
          >{{ JSON.stringify(store.comparisonResult.missingInSecond, null, 2) }}</pre>
          <div v-else class="p-4 text-center text-gray-500 italic">
            No missing keys found
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="store.comparisonResult && store.bothValid" class="mt-6 p-4 bg-blue-50 rounded-lg">
      <div class="flex items-center">
        <InformationCircleIcon class="h-5 w-5 text-blue-500 mr-2" />
        <div class="text-sm text-blue-800">
          <p v-if="!store.comparisonResult.hasChanges" class="font-medium">
            ✅ No structural differences found between the JSON objects.
          </p>
          <div v-else>
            <p class="font-medium mb-1">📊 Key Comparison Summary:</p>
            <ul class="list-disc ml-4 space-y-1">
              <li v-if="Object.keys(store.comparisonResult.missingInFirst).length > 0">
                {{ Object.keys(store.comparisonResult.missingInFirst).length }} key(s) missing in {{ cleanFileName(store.json1.name) }}
              </li>
              <li v-if="Object.keys(store.comparisonResult.missingInSecond).length > 0">
                {{ Object.keys(store.comparisonResult.missingInSecond).length }} key(s) missing in {{ cleanFileName(store.json2.name) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div v-if="store.comparisonResult && store.comparisonResult.hasChanges" class="mt-6 flex justify-end">
      <button
        @click="exportResults"
        class="btn-secondary"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export Results
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJsonDiffStore } from '@/stores/counter'
import { useJsonDiff } from '@/composables/useJsonDiff'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const store = useJsonDiffStore()
const { isComparing } = useJsonDiff()

function cleanFileName(name: string): string {
  return name.replace(' (edited)', '')
}

function exportResults() {
  if (!store.comparisonResult) return

  const results = {
    timestamp: new Date().toISOString(),
    files: {
      first: cleanFileName(store.json1.name),
      second: cleanFileName(store.json2.name)
    },
    comparison: {
      mode: 'key',
      compareValues: store.compareValues,
      missingInFirst: store.comparisonResult.missingInFirst,
      missingInSecond: store.comparisonResult.missingInSecond
    }
  }

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `json-key-comparison-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>