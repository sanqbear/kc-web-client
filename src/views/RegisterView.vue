<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { KcButton, KcInput } from '@/components/ui'

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
          <KcInput
            v-model="lastName"
            :label="t('auth.lastName')"
            :placeholder="t('auth.lastNamePlaceholder')"
            required
            autocomplete="family-name"
          />
          <KcInput
            v-model="firstName"
            :label="t('auth.firstName')"
            :placeholder="t('auth.firstNamePlaceholder')"
            required
            autocomplete="given-name"
          />
        </div>

        <KcInput
          v-model="loginId"
          :label="t('auth.loginId')"
          :placeholder="t('auth.loginIdPlaceholder')"
          required
          autocomplete="username"
        />

        <KcInput
          v-model="email"
          type="email"
          :label="t('auth.email')"
          :placeholder="t('auth.emailPlaceholder')"
          required
          autocomplete="email"
        />

        <KcInput
          v-model="password"
          type="password"
          :label="t('auth.password')"
          :placeholder="t('validation.minLength', { min: 8 })"
          required
          autocomplete="new-password"
        />

        <KcInput
          v-model="passwordConfirm"
          type="password"
          :label="t('auth.passwordConfirm')"
          :placeholder="t('auth.passwordConfirmPlaceholder')"
          required
          autocomplete="new-password"
        />

        <div v-if="validationError || authStore.error" class="text-danger-600 text-sm text-center">
          {{ validationError || authStore.error }}
        </div>

        <KcButton
          type="submit"
          :loading="authStore.loading"
          full-width
        >
          {{ authStore.loading ? t('auth.registering') : t('auth.register') }}
        </KcButton>

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
