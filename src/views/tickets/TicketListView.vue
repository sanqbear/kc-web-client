<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import type { TicketStatus, TicketPriority } from '@/types/ticket'

const { t } = useI18n()
const router = useRouter()
const ticketStore = useTicketStore()

const statusColors: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  WAITING_FOR_INFO: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REOPENED: 'bg-red-100 text-red-800',
}

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const hasPrevPage = computed(() => ticketStore.currentPage > 1)
const hasNextPage = computed(
  () => ticketStore.currentPage < ticketStore.totalPages,
)

onMounted(() => {
  ticketStore.fetchTickets()
})

function goToTicket(id: string) {
  router.push({ name: 'ticket-detail', params: { id } })
}

function createTicket() {
  router.push({ name: 'ticket-create' })
}

function changePage(page: number) {
  ticketStore.fetchTickets(page)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ t('ticket.list') }}
      </h1>
      <button
        @click="createTicket"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {{ t('ticket.create') }}
      </button>
    </div>

    <div v-if="ticketStore.loading" class="text-center py-8">
      <p class="text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="ticketStore.error" class="text-center py-8">
      <p class="text-red-500">{{ ticketStore.error }}</p>
    </div>

    <div v-else-if="ticketStore.tickets.length === 0" class="text-center py-8">
      <p class="text-gray-500">{{ t('ticket.noTickets') }}</p>
    </div>

    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.title') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.status') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.priority') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.requestType') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.dueDate') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t('ticket.createdAt') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="ticket in ticketStore.tickets"
            :key="ticket.id"
            @click="goToTicket(ticket.id)"
            class="hover:bg-gray-50 cursor-pointer"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ ticket.title }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusColors[ticket.status],
                ]"
              >
                {{ t(`ticket.statusValues.${ticket.status}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  priorityColors[ticket.priority],
                ]"
              >
                {{ t(`ticket.priorityValues.${ticket.priority}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ t(`ticket.requestTypeValues.${ticket.request_type}`) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ ticket.due_date ? formatDate(ticket.due_date) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(ticket.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200"
      >
        <div class="text-sm text-gray-700">
          {{
            t('ticket.pagination', {
              total: ticketStore.totalCount,
              page: ticketStore.currentPage,
              pages: ticketStore.totalPages,
            })
          }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(ticketStore.currentPage - 1)"
            :disabled="!hasPrevPage"
            class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ t('common.prev') }}
          </button>
          <button
            @click="changePage(ticketStore.currentPage + 1)"
            :disabled="!hasNextPage"
            class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
