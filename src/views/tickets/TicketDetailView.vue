<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import type { TicketStatus, TicketPriority } from '@/types/ticket'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const newEntryBody = ref('')
const showDeleteConfirm = ref(false)

const ticketId = computed(() => route.params.id as string)

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

onMounted(() => {
  ticketStore.fetchTicket(ticketId.value)
})

function goBack() {
  router.push({ name: 'tickets' })
}

function editTicket() {
  router.push({ name: 'ticket-edit', params: { id: ticketId.value } })
}

async function deleteTicket() {
  const success = await ticketStore.deleteTicket(ticketId.value)
  if (success) {
    router.push({ name: 'tickets' })
  }
  showDeleteConfirm.value = false
}

async function addEntry() {
  if (!newEntryBody.value.trim()) return

  const entry = await ticketStore.addEntry(ticketId.value, {
    body: newEntryBody.value,
    entry_type: 'COMMENT',
    format: 'PLAIN_TEXT',
  })

  if (entry) {
    newEntryBody.value = ''
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

function getUserName(name?: { first?: string; last?: string }) {
  if (!name) return t('ticket.unknownUser')
  return `${name.last || ''}${name.first || ''}`
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4">
      <button
        @click="goBack"
        class="text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        <span>&larr;</span>
        <span>{{ t('common.back') }}</span>
      </button>
    </div>

    <div v-if="ticketStore.loading" class="text-center py-8">
      <p class="text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="ticketStore.error" class="text-center py-8">
      <p class="text-red-500">{{ ticketStore.error }}</p>
    </div>

    <div v-else-if="ticketStore.currentTicket" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ ticketStore.currentTicket.title }}
          </h1>
          <div class="flex gap-2">
            <button
              @click="editTicket"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {{ t('common.edit') }}
            </button>
            <button
              @click="showDeleteConfirm = true"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">{{ t('ticket.status') }}</p>
            <span
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                statusColors[ticketStore.currentTicket.status],
              ]"
            >
              {{
                t(`ticket.statusValues.${ticketStore.currentTicket.status}`)
              }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('ticket.priority') }}</p>
            <span
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                priorityColors[ticketStore.currentTicket.priority],
              ]"
            >
              {{
                t(`ticket.priorityValues.${ticketStore.currentTicket.priority}`)
              }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('ticket.requestType') }}</p>
            <p class="text-sm font-medium">
              {{
                t(
                  `ticket.requestTypeValues.${ticketStore.currentTicket.request_type}`,
                )
              }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('ticket.dueDate') }}</p>
            <p class="text-sm font-medium">
              {{
                ticketStore.currentTicket.due_date
                  ? formatDate(ticketStore.currentTicket.due_date)
                  : '-'
              }}
            </p>
          </div>
        </div>

        <div
          v-if="
            ticketStore.currentTicket.tags &&
            ticketStore.currentTicket.tags.length > 0
          "
          class="mb-4"
        >
          <p class="text-sm text-gray-500 mb-2">{{ t('ticket.tags') }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in ticketStore.currentTicket.tags"
              :key="tag.id"
              class="px-2 py-1 text-xs rounded-full"
              :style="{
                backgroundColor: tag.color_code || '#e5e7eb',
                color: tag.color_code ? '#fff' : '#374151',
              }"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="border-t pt-4">
          <p class="text-sm text-gray-500">
            {{ t('ticket.createdAt') }}:
            {{ formatDate(ticketStore.currentTicket.created_at) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ t('ticket.updatedAt') }}:
            {{ formatDate(ticketStore.currentTicket.updated_at) }}
          </p>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          {{ t('ticket.entries') }}
        </h2>

        <div
          v-if="
            !ticketStore.currentTicket.entries ||
            ticketStore.currentTicket.entries.length === 0
          "
          class="text-center py-4"
        >
          <p class="text-gray-500">{{ t('ticket.noEntries') }}</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="entry in ticketStore.currentTicket.entries"
            :key="entry.id"
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ getUserName(entry.author_user_name) }}
                </span>
                <span
                  class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {{ t(`ticket.entryTypes.${entry.entry_type}`) }}
                </span>
              </div>
              <span class="text-xs text-gray-500">
                {{ formatDate(entry.created_at) }}
              </span>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap">{{ entry.body }}</p>
          </div>
        </div>

        <div class="mt-6 border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">
            {{ t('ticket.addEntry') }}
          </h3>
          <textarea
            v-model="newEntryBody"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="t('ticket.entryPlaceholder')"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="addEntry"
              :disabled="!newEntryBody.trim() || ticketStore.loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('ticket.submitEntry') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          {{ t('ticket.deleteConfirmTitle') }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ t('ticket.deleteConfirmMessage') }}
        </p>
        <div class="flex justify-end gap-2">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="deleteTicket"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
