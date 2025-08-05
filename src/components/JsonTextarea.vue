<template>
  <div class="relative">
    <!-- Label and Actions -->
    <div class="flex justify-between items-center mb-2">
      <label :for="id" class="text-sm font-medium text-gray-700 flex items-center">
        <DocumentTextIcon class="h-4 w-4 mr-2" />
        {{ displayName }}
        <span v-if="!isValid" class="ml-2 text-red-500 text-xs">(Invalid JSON)</span>
      </label>
      <button
        v-if="hasContent"
        @click="clearContent"
        class="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
      >
        <TrashIcon class="h-4 w-4" />
        Clear
      </button>
    </div>

    <!-- Textarea -->
    <div 
      class="relative textarea-container"
      :class="{ 'border-red-300': !isValid && hasContent }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"  
      @drop="handleDrop"
    >
      <textarea
        :id="id"
        v-model="content"
        :placeholder="placeholder"
        class="textarea-field"
        :class="[
          'min-h-[300px] w-full',
          { 
            'border-red-300 focus:border-red-500 focus:ring-red-500': !isValid && hasContent,
            'border-blue-400': isDragOver
          }
        ]"
        @input="handleInput"
        @paste="handlePaste"
      />
      
      <!-- Drag overlay -->
      <div
        v-show="isDragOver"
        class="absolute inset-0 bg-primary-50 border-2 border-dashed border-primary-400 rounded-md flex items-center justify-center pointer-events-none"
      >
        <div class="text-center">
          <CloudArrowUpIcon class="h-12 w-12 text-primary-500 mx-auto mb-2" />
          <p class="text-primary-700 font-medium">Drop JSON file here</p>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="!isValid && hasContent && error" class="mt-2 text-sm text-red-600">
      <ExclamationTriangleIcon class="h-4 w-4 inline mr-1" />
      {{ error }}
    </div>

    <!-- File info -->
    <div v-if="hasContent" class="mt-2 text-xs text-gray-500 flex items-center justify-between">
      <span>{{ content.split('\n').length }} lines, {{ content.length }} characters</span>
      <span v-if="isEdited" class="text-orange-600">(edited)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DocumentTextIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  id: string
  modelValue: string
  name: string
  placeholder?: string
  isValid?: boolean
  error?: string
  isEdited?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'file-dropped', file: File): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Paste or drop your JSON here...',
  isValid: true,
  isEdited: false
})

const emit = defineEmits<Emits>()

const isDragOver = ref(false)

const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const hasContent = computed(() => props.modelValue.trim() !== '')

const displayName = computed(() => {
  return props.name + (props.isEdited ? ' (edited)' : '')
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function handlePaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text')
  if (pastedText) {
    try {
      const parsed = JSON.parse(pastedText)
      const formatted = JSON.stringify(parsed, null, 2)
      setTimeout(() => {
        content.value = formatted
      }, 0)
    } catch {
      // If it's not valid JSON, just paste as is
    }
  }
}

function clearContent() {
  emit('clear')
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  const hasFiles = event.dataTransfer?.items && 
    Array.from(event.dataTransfer.items).some(item => item.kind === 'file')
  
  if (hasFiles) {
    isDragOver.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      emit('file-dropped', file)
    } else {
      // Try to read as text anyway
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        try {
          JSON.parse(content)
          emit('file-dropped', file)
        } catch {
          alert('Please drop a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
  }
}
</script>

<style scoped>
.textarea-container {
  @apply transition-all duration-300 ease-in-out;
}

.textarea-container:hover {
  @apply transform -translate-y-0.5;
}

.textarea-field {
  @apply transition-all duration-200;
}

.textarea-field:focus {
  @apply shadow-lg;
}
</style>