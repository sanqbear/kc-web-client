<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginId = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await authStore.login({
    login_id: loginId.value,
    password: password.value,
  })

  if (success) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
        {{ t('auth.login') }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="loginId" class="block text-sm font-medium text-gray-700">
            {{ t('auth.loginId') }}
          </label>
          <input
            id="loginId"
            v-model="loginId"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('auth.loginIdPlaceholder')"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            {{ t('auth.password') }}
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('auth.passwordPlaceholder')"
          />
        </div>

        <div v-if="authStore.error" class="text-red-600 text-sm text-center">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="authStore.loading">{{ t('auth.loggingIn') }}</span>
          <span v-else>{{ t('auth.login') }}</span>
        </button>

        <p class="text-center text-sm text-gray-600">
          {{ t('auth.noAccount') }}
          <router-link to="/register" class="text-blue-600 hover:text-blue-500">
            {{ t('auth.register') }}
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>
