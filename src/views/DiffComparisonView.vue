<template>
  <div class="card p-6">
    <h2 class="text-xl font-semibold mb-6 flex items-center">
      <CodeBracketIcon class="h-5 w-5 mr-2" />
      Detailed Diff
    </h2>

    <div v-if="!store.hasJsonFiles" class="text-center py-12">
      <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Provide both JSON inputs to generate detailed diff.</p>
    </div>

    <div v-else-if="!store.bothValid" class="text-center py-12">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto mb-4" />
      <p class="text-red-600">Please ensure both JSON inputs are valid.</p>
    </div>

    <div v-else-if="isComparing" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Generating detailed diff...</p>
    </div>

    <div v-else-if="store.comparisonResult">
      <!-- Diff Legend -->
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
        <div class="flex flex-wrap gap-4 text-xs">
          <div class="flex items-center">
            <span class="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></span>
            <span class="text-green-700">+ Added keys</span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></span>
            <span class="text-red-700">- Removed keys</span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></span>
            <span class="text-orange-700">~ Changed values</span>
          </div>
        </div>
      </div>

      <!-- Diff Results -->
      <div class="bg-gray-50 rounded-lg border min-h-[300px] max-h-[500px] overflow-auto">
        <div
          v-if="store.comparisonResult.diffHtml"
          class="p-4 text-sm font-mono leading-relaxed"
          v-html="store.comparisonResult.diffHtml"
        ></div>
        <div v-else class="p-4 text-center text-gray-500 italic">
          No differences found between the JSON objects.
        </div>
      </div>

      <!-- File Comparison Info -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-3 bg-blue-50 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 mb-1">{{ cleanFileName(store.json1.name) }}</h4>
          <p class="text-xs text-blue-600">
            {{ JSON.parse(store.json1.content).constructor === Object ? 'Object' : 'Array' }} with 
            {{ Object.keys(JSON.parse(store.json1.content)).length }} top-level keys
          </p>
        </div>
        <div class="p-3 bg-green-50 rounded-lg">
          <h4 class="text-sm font-medium text-green-800 mb-1">{{ cleanFileName(store.json2.name) }}</h4>
          <p class="text-xs text-green-600">
            {{ JSON.parse(store.json2.content).constructor === Object ? 'Object' : 'Array' }} with 
            {{ Object.keys(JSON.parse(store.json2.content)).length }} top-level keys
          </p>
        </div>
      </div>

      <!-- Advanced Options -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Advanced Options</h4>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="showUnifiedDiff"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <span class="ml-2 text-sm text-gray-700">Show unified diff format</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="ignoreWhitespace"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <span class="ml-2 text-sm text-gray-700">Ignore whitespace differences</span>
          </label>
        </div>
      </div>

      <!-- Unified Diff View -->
      <div v-if="showUnifiedDiff" class="mt-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Unified Diff:</h4>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-64">
          <pre>{{ unifiedDiff }}</pre>
        </div>
      </div>

      <!-- Export Options -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <InformationCircleIcon class="h-4 w-4 inline mr-1" />
          {{ store.comparisonResult.hasChanges ? 'Differences detected' : 'No differences found' }}
        </div>
        <div class="flex gap-2">
          <button
            v-if="showUnifiedDiff"
            @click="copyUnifiedDiff"
            class="btn-secondary text-xs"
          >
            <ClipboardIcon class="h-4 w-4" />
            Copy Diff
          </button>
          <button
            @click="exportResults"
            class="btn-secondary"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
            Export Results
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createTwoFilesPatch } from 'diff'
import { useJsonDiffStore } from '@/stores/counter'
import { useJsonDiff } from '@/composables/useJsonDiff'
import {
  CodeBracketIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ClipboardIcon
} from '@heroicons/vue/24/outline'

const store = useJsonDiffStore()
const { isComparing } = useJsonDiff()

const showUnifiedDiff = ref(false)
const ignoreWhitespace = ref(false)

const unifiedDiff = computed(() => {
  if (!store.bothValid || !store.hasJsonFiles) return ''
  
  const json1Formatted = JSON.stringify(JSON.parse(store.json1.content), null, 2)
  const json2Formatted = JSON.stringify(JSON.parse(store.json2.content), null, 2)
  
  return createTwoFilesPatch(
    cleanFileName(store.json1.name),
    cleanFileName(store.json2.name),
    json1Formatted,
    json2Formatted,
    undefined,
    undefined,
    {
      ignoreWhitespace: ignoreWhitespace.value
    }
  )
})

function cleanFileName(name: string): string {
  return name.replace(' (edited)', '')
}

async function copyUnifiedDiff() {
  try {
    await navigator.clipboard.writeText(unifiedDiff.value)
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy diff:', error)
  }
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
      mode: 'diff',
      compareValues: store.compareValues,
      diffHtml: store.comparisonResult.diffHtml,
      unifiedDiff: unifiedDiff.value
    }
  }

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `json-diff-comparison-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>