<template>
  <div class="relative">
    <!-- Label and Actions -->
    <div class="flex justify-between items-center mb-3">
      <label :for="id" class="text-base font-semibold text-foreground flex items-center">
        <DocumentTextIcon class="h-5 w-5 mr-2 text-primary" />
        {{ displayName }}
        <Badge 
          v-if="hasContent"
          class="ml-3"
          :variant="isValid ? 'default' : 'destructive'"
        >
          {{ isValid ? '✓ Valid' : '✗ Invalid' }}
        </Badge>
      </label>
      <Button
        v-if="hasContent"
        @click="clearContent"
        variant="outline"
        size="sm"
        class="text-destructive hover:text-destructive"
      >
        <TrashIcon class="h-4 w-4" />
        Clear
      </Button>
    </div>

    <!-- Textarea -->
    <div
      class="relative drop-zone"
      :class="{ 
        'drag-over': isDragOver,
        '!border-destructive !bg-destructive/10': !isValid && hasContent 
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <Textarea
        :id="id"
        v-model="content"
        :placeholder="placeholder"
        class="json-editor min-h-[400px] resize-none border-0 bg-transparent"
        :class="{
          '!border-destructive': !isValid && hasContent,
        }"
        @input="handleInput"
        @paste="handlePaste"
      />

      <!-- Drag overlay -->
      <div
        v-show="isDragOver"
        class="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none backdrop-blur-sm"
      >
        <div class="text-center">
          <CloudArrowUpIcon class="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
          <p class="text-primary font-medium">Drop JSON file here</p>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="!isValid && hasContent && error" class="mt-2 text-sm text-destructive">
      <ExclamationTriangleIcon class="h-4 w-4 inline mr-1" />
      {{ error }}
    </div>

    <!-- File info -->
    <div v-if="hasContent" class="mt-2 text-xs text-muted-foreground flex items-center justify-between">
      <span>{{ content.split('\n').length }} lines, {{ content.length }} characters</span>
      <span v-if="isEdited" class="text-orange-500">(edited)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DocumentTextIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

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
  isEdited: false,
})

const emit = defineEmits<Emits>()

const isDragOver = ref(false)

const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
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

  const hasFiles =
    event.dataTransfer?.items &&
    Array.from(event.dataTransfer.items).some((item) => item.kind === 'file')

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.textarea-container:hover {
  transform: translateY(-0.125rem);
}

.textarea-field {
  transition: all 0.2s;
}

.textarea-field:focus {
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}
</style>
