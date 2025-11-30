<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const loginId = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const firstName = ref('')
const lastName = ref('')

const validationError = ref('')

async function handleSubmit() {
  validationError.value = ''

  if (password.value !== passwordConfirm.value) {
    validationError.value = t('auth.passwordMismatch')
    return
  }

  if (password.value.length < 8) {
    validationError.value = t('auth.passwordTooShort')
    return
  }

  const success = await authStore.register({
    login_id: loginId.value,
    email: email.value,
    password: password.value,
    name: {
      first: firstName.value,
      last: lastName.value,
    },
  })

  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
        {{ t('auth.register') }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              {{ t('auth.lastName') }}
            </label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('auth.lastNamePlaceholder')"
            />
          </div>
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              {{ t('auth.firstName') }}
            </label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('auth.firstNamePlaceholder')"
            />
          </div>
        </div>

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
          <label for="email" class="block text-sm font-medium text-gray-700">
            {{ t('auth.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('auth.emailPlaceholder')"
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
            :placeholder="t('validation.minLength', { min: 8 })"
          />
        </div>

        <div>
          <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">
            {{ t('auth.passwordConfirm') }}
          </label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('auth.passwordConfirmPlaceholder')"
          />
        </div>

        <div v-if="validationError || authStore.error" class="text-red-600 text-sm text-center">
          {{ validationError || authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="authStore.loading">{{ t('auth.registering') }}</span>
          <span v-else>{{ t('auth.register') }}</span>
        </button>

        <p class="text-center text-sm text-gray-600">
          {{ t('auth.hasAccount') }}
          <router-link to="/login" class="text-blue-600 hover:text-blue-500">
            {{ t('auth.login') }}
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>
