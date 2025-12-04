<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

interface NavItem {
  name: string
  label: string
  icon: string
  path: string
}

const navItems = computed<NavItem[]>(() => [
  {
    name: 'home',
    label: t('nav.home'),
    icon: 'home',
    path: '/',
  },
  {
    name: 'tickets',
    label: t('nav.tickets'),
    icon: 'ticket',
    path: '/tickets',
  },
])

function isActive(item: NavItem): boolean {
  if (item.path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(item.path)
}

function navigate(path: string) {
  router.push(path)
  emit('close')
}
</script>

<template>
  <!-- Sidebar container -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200',
      'transform transition-transform duration-300 ease-in-out',
      'lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo area -->
    <div class="flex items-center h-16 px-6 border-b border-secondary-200">
      <router-link to="/" class="flex items-center gap-3" @click="emit('close')">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">K</span>
        </div>
        <span class="text-lg font-semibold text-secondary-900">
          {{ t('common.appName') }}
        </span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <button
        v-for="item in navItems"
        :key="item.name"
        type="button"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
          isActive(item)
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
        ]"
        @click="navigate(item.path)"
      >
        <!-- Icons -->
        <svg
          v-if="item.icon === 'home'"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg
          v-else-if="item.icon === 'ticket'"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>

        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Bottom section -->
    <div class="border-t border-secondary-200 p-4">
      <p class="text-xs text-secondary-400 text-center">
        v0.1.0
      </p>
    </div>
  </aside>
</template>
