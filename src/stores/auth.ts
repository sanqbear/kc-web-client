import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/utils/api'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const roles = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      accessToken.value = response.tokens.access_token
      user.value = response.user
      localStorage.setItem('accessToken', response.tokens.access_token)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.register(data)
      accessToken.value = response.tokens.access_token
      user.value = response.user
      localStorage.setItem('accessToken', response.tokens.access_token)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return false

    loading.value = true
    try {
      const response = await authApi.me()
      user.value = response.user
      roles.value = response.roles || []
      return true
    } catch {
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    } finally {
      user.value = null
      accessToken.value = null
      roles.value = []
      localStorage.removeItem('accessToken')
    }
  }

  async function refreshToken() {
    try {
      const response = await authApi.refresh()
      accessToken.value = response.access_token
      localStorage.setItem('accessToken', response.access_token)
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    user,
    accessToken,
    roles,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    fetchMe,
    logout,
    refreshToken,
  }
})
