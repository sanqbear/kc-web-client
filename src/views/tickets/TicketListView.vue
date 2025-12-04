<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import { KcButton } from '@/components/ui'
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
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-900">
        {{ t('ticket.list') }}
      </h1>
      <KcButton @click="createTicket">
        {{ t('ticket.create') }}
      </KcButton>
    </div>

    <!-- Loading state -->
    <div v-if="ticketStore.loading" class="text-center py-12">
      <div class="inline-flex items-center gap-2 text-secondary-500">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ t('common.loading') }}
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="ticketStore.error" class="text-center py-12">
      <p class="text-danger-500">{{ ticketStore.error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="ticketStore.tickets.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <p class="text-secondary-500">{{ t('ticket.noTickets') }}</p>
    </div>

    <!-- Ticket table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
      <!-- Desktop table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="min-w-full divide-y divide-secondary-200">
          <thead class="bg-secondary-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.title') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.priority') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.requestType') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.dueDate') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {{ t('ticket.createdAt') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-secondary-200">
            <tr
              v-for="ticket in ticketStore.tickets"
              :key="ticket.id"
              @click="goToTicket(ticket.id)"
              class="hover:bg-secondary-50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-secondary-900">
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                {{ t(`ticket.requestTypeValues.${ticket.request_type}`) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                {{ ticket.due_date ? formatDate(ticket.due_date) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                {{ formatDate(ticket.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile card list -->
      <div class="lg:hidden divide-y divide-secondary-200">
        <div
          v-for="ticket in ticketStore.tickets"
          :key="ticket.id"
          @click="goToTicket(ticket.id)"
          class="p-4 hover:bg-secondary-50 cursor-pointer transition-colors"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-sm font-medium text-secondary-900 line-clamp-2">
              {{ ticket.title }}
            </h3>
            <span
              :class="[
                'shrink-0 px-2 py-1 text-xs font-medium rounded-full',
                statusColors[ticket.status],
              ]"
            >
              {{ t(`ticket.statusValues.${ticket.status}`) }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2 text-xs text-secondary-500">
            <span
              :class="[
                'px-2 py-0.5 rounded-full',
                priorityColors[ticket.priority],
              ]"
            >
              {{ t(`ticket.priorityValues.${ticket.priority}`) }}
            </span>
            <span class="text-secondary-400">•</span>
            <span>{{ t(`ticket.requestTypeValues.${ticket.request_type}`) }}</span>
            <span class="text-secondary-400">•</span>
            <span>{{ formatDate(ticket.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-secondary-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-secondary-200">
        <div class="text-sm text-secondary-600">
          {{
            t('ticket.pagination', {
              total: ticketStore.totalCount,
              page: ticketStore.currentPage,
              pages: ticketStore.totalPages,
            })
          }}
        </div>
        <div class="flex gap-2">
          <KcButton
            variant="outline"
            size="sm"
            :disabled="!hasPrevPage"
            @click="changePage(ticketStore.currentPage - 1)"
          >
            {{ t('common.prev') }}
          </KcButton>
          <KcButton
            variant="outline"
            size="sm"
            :disabled="!hasNextPage"
            @click="changePage(ticketStore.currentPage + 1)"
          >
            {{ t('common.next') }}
          </KcButton>
        </div>
      </div>
    </div>
  </div>
</template>
