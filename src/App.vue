<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { AppLayout } from '@/components/layout'

const route = useRoute()

// 레이아웃이 필요 없는 페이지들 (로그인, 회원가입)
const isGuestPage = computed(() => route.meta.guest === true)
</script>

<template>
  <!-- Guest pages (login, register) - no layout -->
  <RouterView v-if="isGuestPage" />

  <!-- Authenticated pages - with layout -->
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
