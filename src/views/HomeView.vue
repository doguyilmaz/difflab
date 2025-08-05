<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="flex justify-center mb-6">
          <div class="p-3 bg-primary-100 rounded-full">
            <CodeBracketIcon class="h-12 w-12 text-primary-600" />
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          JSON Diff Tool
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Compare and analyze JSON objects with an intuitive interface and powerful features.
          Built with modern Vue 3, TypeScript, and Tailwind CSS.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div class="card p-6">
          <div class="flex items-center mb-4">
            <DocumentDuplicateIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">Two Comparison Modes</h3>
          </div>
          <p class="text-gray-600">
            Choose between Key Comparison to see missing keys, or Diff Comparison for detailed differences.
          </p>
        </div>

        <div class="card p-6">
          <div class="flex items-center mb-4">
            <CloudArrowUpIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">Drag & Drop Support</h3>
          </div>
          <p class="text-gray-600">
            Simply drag and drop your JSON files, or paste content directly into the text areas.
          </p>
        </div>

        <div class="card p-6">
          <div class="flex items-center mb-4">
            <CheckCircleIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">Real-time Validation</h3>
          </div>
          <p class="text-gray-600">
            Automatic JSON validation with clear error messages and instant comparison results.
          </p>
        </div>

        <div class="card p-6">
          <div class="flex items-center mb-4">
            <EyeIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">Value Comparison</h3>
          </div>
          <p class="text-gray-600">
            Toggle value comparison to check for differences in both structure and content.
          </p>
        </div>

        <div class="card p-6">
          <div class="flex items-center mb-4">
            <ClockIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">History Tracking</h3>
          </div>
          <p class="text-gray-600">
            Keep track of your previous comparisons and quickly revisit them when needed.
          </p>
        </div>

        <div class="card p-6">
          <div class="flex items-center mb-4">
            <CogIcon class="h-8 w-8 text-primary-600 mr-3" />
            <h3 class="text-lg font-semibold text-gray-900">Customizable Settings</h3>
          </div>
          <p class="text-gray-600">
            Adjust preferences, themes, and comparison options to suit your workflow.
          </p>
        </div>
      </div>

      <!-- Quick Start Section -->
      <div class="card p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p class="text-gray-600 mb-6">
            Jump right into comparing your JSON files with our intuitive interface.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/compare"
            class="btn-primary justify-center"
          >
            <DocumentDuplicateIcon class="h-5 w-5" />
            Start Comparing
          </router-link>
          
          <button
            @click="loadSampleData"
            class="btn-secondary justify-center"
          >
            <BeakerIcon class="h-5 w-5" />
            Try Sample Data
          </button>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="mt-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Simple steps to compare your JSON files effectively
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-bold text-lg">1</span>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Input Your JSON</h3>
            <p class="text-gray-600">
              Paste JSON content or drag & drop files into the comparison areas.
            </p>
          </div>

          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-bold text-lg">2</span>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Choose Comparison Mode</h3>
            <p class="text-gray-600">
              Select between Key or Diff comparison based on what you need to analyze.
            </p>
          </div>

          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-bold text-lg">3</span>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">View Results</h3>
            <p class="text-gray-600">
              Get instant, detailed results showing exactly what's different between your files.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useJsonDiffStore } from '@/stores/counter'
import AppLayout from '@/components/AppLayout.vue'
import {
  CodeBracketIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  EyeIcon,
  ClockIcon,
  CogIcon,
  BeakerIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useJsonDiffStore()

function loadSampleData() {
  const sampleJson1 = {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "hobbies": ["reading", "swimming"],
    "address": {
      "street": "123 Main St",
      "zipcode": "10001"
    }
  }

  const sampleJson2 = {
    "name": "John Doe",
    "age": 31,
    "city": "Boston",
    "hobbies": ["reading", "cycling", "photography"],
    "address": {
      "street": "456 Oak Ave",
      "zipcode": "02101"
    },
    "email": "john@example.com"
  }

  store.updateJsonFile('json1', {
    content: JSON.stringify(sampleJson1, null, 2),
    name: 'Sample JSON 1',
    isEdited: false
  })

  store.updateJsonFile('json2', {
    content: JSON.stringify(sampleJson2, null, 2),
    name: 'Sample JSON 2',
    isEdited: false
  })

  router.push('/compare')
}
</script>