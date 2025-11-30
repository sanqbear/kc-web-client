<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const userName = computed(() => {
  if (!authStore.user?.name) return ''
  return `${authStore.user.name.last || ''}${authStore.user.name.first || ''}`
})

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchMe()
  }
})

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-800">
              {{ t('common.appName') }}
            </h1>
          </div>
          <div class="flex items-center gap-4">
            <span v-if="authStore.user" class="text-gray-600">
              {{ t('home.greeting', { name: userName }) }}
            </span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {{ t('auth.logout') }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <p class="text-gray-500 text-lg">
            {{ t('common.welcome') }}! {{ t('home.welcomeMessage') }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
