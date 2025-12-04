<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchMe()
  }
})
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-secondary-900">
        {{ t('nav.home') }}
      </h1>
    </div>

    <!-- Welcome card -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-secondary-900 mb-2">
          {{ t('common.welcome') }}!
        </h2>
        <p class="text-secondary-600">
          {{ t('home.welcomeMessage') }}
        </p>
      </div>
    </div>

    <!-- Quick stats placeholder -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">{{ t('nav.tickets') }}</p>
            <p class="text-2xl font-bold text-secondary-900">-</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">{{ t('ticket.statusValues.RESOLVED') }}</p>
            <p class="text-2xl font-bold text-secondary-900">-</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">{{ t('ticket.statusValues.IN_PROGRESS') }}</p>
            <p class="text-2xl font-bold text-secondary-900">-</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">{{ t('ticket.priorityValues.CRITICAL') }}</p>
            <p class="text-2xl font-bold text-secondary-900">-</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
