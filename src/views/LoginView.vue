<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { KcButton, KcInput } from '@/components/ui'

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
        <KcInput
          v-model="loginId"
          type="text"
          :label="t('auth.loginId')"
          :placeholder="t('auth.loginIdPlaceholder')"
          required
          autocomplete="username"
        />

        <KcInput
          v-model="password"
          type="password"
          :label="t('auth.password')"
          :placeholder="t('auth.passwordPlaceholder')"
          required
          autocomplete="current-password"
        />

        <div v-if="authStore.error" class="text-danger-600 text-sm text-center">
          {{ authStore.error }}
        </div>

        <KcButton
          type="submit"
          :loading="authStore.loading"
          full-width
        >
          {{ authStore.loading ? t('auth.loggingIn') : t('auth.login') }}
        </KcButton>

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
