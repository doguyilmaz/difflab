<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-18">
          <!-- Logo and title -->
          <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
              <div class="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg">
                <CodeBracketIcon class="h-6 w-6 text-white" />
              </div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">JSON Diff Tool</h1>
            </router-link>
          </div>

          <!-- Navigation links -->
          <div class="hidden md:flex items-center gap-8">
            <router-link
              to="/"
              class="nav-link"
              :class="{ 'active': $route.name === 'home' }"
            >
              <HomeIcon class="h-4 w-4" />
              Home
            </router-link>
            <router-link
              to="/compare"
              class="nav-link"
              :class="{ 'active': $route.path.startsWith('/compare') }"
            >
              <DocumentDuplicateIcon class="h-4 w-4" />
              Compare
            </router-link>
            <router-link
              to="/history"
              class="nav-link"
              :class="{ 'active': $route.name === 'history' }"
            >
              <ClockIcon class="h-4 w-4" />
              History
            </router-link>
            <router-link
              to="/settings"
              class="nav-link"
              :class="{ 'active': $route.name === 'settings' }"
            >
              <CogIcon class="h-4 w-4" />
              Settings
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
            >
              <Bars3Icon v-if="!isMobileMenuOpen" class="h-6 w-6" />
              <XMarkIcon v-else class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div class="flex flex-col gap-1">
            <router-link
              to="/"
              class="mobile-nav-link"
              :class="{ 'active': $route.name === 'home' }"
              @click="isMobileMenuOpen = false"
            >
              <HomeIcon class="h-4 w-4" />
              Home
            </router-link>
            <router-link
              to="/compare"
              class="mobile-nav-link"
              :class="{ 'active': $route.path.startsWith('/compare') }"
              @click="isMobileMenuOpen = false"
            >
              <DocumentDuplicateIcon class="h-4 w-4" />
              Compare
            </router-link>
            <router-link
              to="/history"
              class="mobile-nav-link"
              :class="{ 'active': $route.name === 'history' }"
              @click="isMobileMenuOpen = false"
            >
              <ClockIcon class="h-4 w-4" />
              History
            </router-link>
            <router-link
              to="/settings"
              class="mobile-nav-link"
              :class="{ 'active': $route.name === 'settings' }"
              @click="isMobileMenuOpen = false"
            >
              <CogIcon class="h-4 w-4" />
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-600">
            © 2024 JSON Diff Tool - Modern Vue 3 Implementation
          </div>
          <div class="flex gap-6 mt-4 md:mt-0">
            <a
              href="https://github.com/doguyilmaz/json-diff-tool"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 hover:text-primary-600 transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CodeBracketIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const isMobileMenuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(75 85 99);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
  transform: translateY(-1px);
}

.nav-link.active {
  color: var(--color-primary-700);
  background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100));
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.15);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: rgb(75 85 99);
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  color: var(--color-primary-600);
  background-color: rgb(249 250 251);
}

.mobile-nav-link.active {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}
</style>