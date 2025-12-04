<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { KcButton } from '@/components/ui'
import AppSidebar from './AppSidebar.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)

const userName = computed(() => {
  if (!authStore.user?.name) return ''
  return `${authStore.user.name.last || ''}${authStore.user.name.first || ''}`
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-secondary-50">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <AppSidebar
      :is-open="isSidebarOpen"
      @close="closeSidebar"
    />

    <!-- Main content area -->
    <div class="lg:pl-64 flex flex-col min-h-screen">
      <!-- Top header -->
      <header class="sticky top-0 z-30 bg-white border-b border-secondary-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <!-- Mobile menu button -->
          <button
            type="button"
            class="lg:hidden p-2 -ml-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
            @click="toggleSidebar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Page title area (can be used by child routes) -->
          <div class="flex-1 lg:flex-none">
            <slot name="header-title" />
          </div>

          <!-- Right side actions -->
          <div class="flex items-center gap-3">
            <span v-if="authStore.user" class="hidden sm:block text-sm text-secondary-600">
              {{ userName }}
            </span>
            <KcButton variant="ghost" size="sm" @click="handleLogout">
              {{ t('auth.logout') }}
            </KcButton>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-secondary-200 bg-white">
        <div class="px-4 sm:px-6 py-4 text-center text-sm text-secondary-500">
          {{ t('common.appName') }} &copy; {{ new Date().getFullYear() }}
        </div>
      </footer>
    </div>
  </div>
</template>
