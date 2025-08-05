<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Compare JSON Files</h1>
        <p class="text-gray-600">
          Upload, paste, or drag & drop your JSON files to compare them side by side.
        </p>
      </div>

      <!-- JSON Input Section -->
      <div class="card p-6 mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- JSON 1 Input -->
          <JsonTextarea
            id="json1"
            v-model="store.json1.content"
            :name="store.json1.name"
            :is-valid="store.json1.isValid"
            :error="store.json1.error"
            :is-edited="store.json1.isEdited"
            placeholder="Paste or drop your first JSON here..."
            @file-dropped="(file) => handleFileDrop(file, 'json1')"
            @clear="() => store.clearJsonFile('json1')"
            @update:model-value="(value) => handleContentUpdate('json1', value)"
          />

          <!-- JSON 2 Input -->
          <JsonTextarea
            id="json2"
            v-model="store.json2.content"
            :name="store.json2.name"
            :is-valid="store.json2.isValid"
            :error="store.json2.error"
            :is-edited="store.json2.isEdited"
            placeholder="Paste or drop your second JSON here..."
            @file-dropped="(file) => handleFileDrop(file, 'json2')"
            @clear="() => store.clearJsonFile('json2')"
            @update:model-value="(value) => handleContentUpdate('json2', value)"
          />
        </div>

        <!-- Controls -->
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <!-- Comparison Mode Buttons -->
          <div class="flex gap-2">
            <router-link
              to="/compare/key"
              class="btn-primary"
              :class="{ 'bg-primary-600': $route.name === 'compare-key' }"
            >
              <KeyIcon class="h-4 w-4" />
              Key Comparison
            </router-link>
            <router-link
              to="/compare/diff"
              class="btn-primary"
              :class="{ 'bg-primary-600': $route.name === 'compare-diff' }"
            >
              <CodeBracketIcon class="h-4 w-4" />
              Diff Comparison
            </router-link>
          </div>

          <!-- Compare Values Toggle -->
          <label class="inline-flex items-center bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
            <input
              v-model="store.compareValues"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <span class="ml-2 text-sm text-gray-700 font-medium">Compare Values</span>
          </label>
        </div>
      </div>

      <!-- Comparison Results -->
      <router-view />

      <!-- Global Drag & Drop Overlay -->
      <div
        v-show="isDragOver"
        class="fixed inset-0 bg-primary-600 bg-opacity-90 flex items-center justify-center z-50"
        @dragover="handleGlobalDragOver"
        @dragleave="handleGlobalDragLeave"
        @drop="handleGlobalDrop"
      >
        <div class="text-center text-white">
          <CloudArrowUpIcon class="h-24 w-24 mx-auto mb-4" />
          <h2 class="text-3xl font-bold mb-2">Drop JSON Files Here</h2>
          <p class="text-xl opacity-90">
            Drop 1-2 JSON files to compare them instantly
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useJsonDiffStore } from '@/stores/counter'
import { useFileHandler } from '@/composables/useFileHandler'
import { useJsonDiff } from '@/composables/useJsonDiff'
import AppLayout from '@/components/AppLayout.vue'
import JsonTextarea from '@/components/JsonTextarea.vue'
import {
  KeyIcon,
  CodeBracketIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'

const store = useJsonDiffStore()
const { handleFileRead, handleMultipleFiles, addEditedLabel } = useFileHandler()
const { validateJson } = useJsonDiff()

const isDragOver = ref(false)

async function handleFileDrop(file: File, targetId: 'json1' | 'json2') {
  try {
    await handleFileRead(file, targetId)
  } catch (error) {
    console.error('Error reading file:', error)
  }
}

function handleContentUpdate(targetId: 'json1' | 'json2', value: string) {
  const validation = validateJson(value)
  
  store.updateJsonFile(targetId, {
    content: value,
    isValid: validation.valid,
    error: validation.error
  })
  
  if (value.trim()) {
    addEditedLabel(targetId)
  }
}

function handleGlobalDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleGlobalDragLeave(event: DragEvent) {
  if (!event.relatedTarget || !document.body.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

async function handleGlobalDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    try {
      await handleMultipleFiles(files)
    } catch (error) {
      console.error('Error handling dropped files:', error)
    }
  }
}

function handleGlobalDragEnter(event: DragEvent) {
  event.preventDefault()
  const hasFiles = event.dataTransfer?.items && 
    Array.from(event.dataTransfer.items).some(item => item.kind === 'file')
  
  if (hasFiles) {
    isDragOver.value = true
  }
}

onMounted(() => {
  document.addEventListener('dragenter', handleGlobalDragEnter)
  document.addEventListener('dragover', handleGlobalDragOver)
  document.addEventListener('dragleave', handleGlobalDragLeave)
  document.addEventListener('drop', handleGlobalDrop)
})

onUnmounted(() => {
  document.removeEventListener('dragenter', handleGlobalDragEnter)
  document.removeEventListener('dragover', handleGlobalDragOver)
  document.removeEventListener('dragleave', handleGlobalDragLeave)
  document.removeEventListener('drop', handleGlobalDrop)
})
</script>