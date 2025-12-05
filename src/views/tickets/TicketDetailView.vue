<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import { KcButton } from '@/components/ui'
import EntryTypeSelector from '@/components/tickets/EntryTypeSelector.vue'
import type { EntryFormData } from '@/components/tickets/EntryTypeSelector.vue'
import type { TicketStatus, TicketPriority } from '@/types/ticket'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

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

async function handleEntrySubmit(data: EntryFormData) {
  if (data.entryType === 'COMMENT') {
    await ticketStore.addEntry(ticketId.value, {
      body: data.body,
      entry_type: 'COMMENT',
      format: data.format,
    })
  } else if (data.entryType === 'FILE' && data.file) {
    await ticketStore.uploadFileEntry(ticketId.value, data.file)
  } else if (data.entryType === 'SCHEDULE') {
    await ticketStore.addEntry(ticketId.value, {
      body: '',
      entry_type: 'SCHEDULE',
      format: 'NONE',
      payload: {
        title: data.scheduleTitle,
        start_date: data.scheduleStartDate,
        end_date: data.scheduleEndDate,
      },
    })
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
  <div>
    <!-- Page header with back button -->
    <div class="flex items-center gap-4 mb-6">
      <KcButton variant="ghost" size="sm" @click="goBack">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ t('common.back') }}
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

    <!-- Ticket content -->
    <div v-else-if="ticketStore.currentTicket" class="space-y-6">
      <!-- Ticket header card -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <h1 class="text-2xl font-bold text-secondary-900">
            {{ ticketStore.currentTicket.title }}
          </h1>
          <div class="flex gap-2 shrink-0">
            <KcButton variant="outline" size="sm" @click="editTicket">
              {{ t('common.edit') }}
            </KcButton>
            <KcButton variant="danger" size="sm" @click="showDeleteConfirm = true">
              {{ t('common.delete') }}
            </KcButton>
          </div>
        </div>

        <!-- Ticket metadata grid -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <p class="text-sm text-secondary-500 mb-1">{{ t('ticket.status') }}</p>
            <span
              :class="[
                'inline-flex px-2.5 py-1 text-xs font-medium rounded-full',
                statusColors[ticketStore.currentTicket.status],
              ]"
            >
              {{ t(`ticket.statusValues.${ticketStore.currentTicket.status}`) }}
            </span>
          </div>
          <div>
            <p class="text-sm text-secondary-500 mb-1">{{ t('ticket.priority') }}</p>
            <span
              :class="[
                'inline-flex px-2.5 py-1 text-xs font-medium rounded-full',
                priorityColors[ticketStore.currentTicket.priority],
              ]"
            >
              {{ t(`ticket.priorityValues.${ticketStore.currentTicket.priority}`) }}
            </span>
          </div>
          <div>
            <p class="text-sm text-secondary-500 mb-1">{{ t('ticket.requestType') }}</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ t(`ticket.requestTypeValues.${ticketStore.currentTicket.request_type}`) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-secondary-500 mb-1">{{ t('ticket.assignee') }}</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ ticketStore.currentTicket.assigned_user_name ? getUserName(ticketStore.currentTicket.assigned_user_name) : t('ticket.unassigned') }}
            </p>
          </div>
          <div>
            <p class="text-sm text-secondary-500 mb-1">{{ t('ticket.dueDate') }}</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ ticketStore.currentTicket.due_date ? formatDate(ticketStore.currentTicket.due_date) : '-' }}
            </p>
          </div>
        </div>

        <!-- Tags -->
        <div
          v-if="ticketStore.currentTicket.tags && ticketStore.currentTicket.tags.length > 0"
          class="mb-6"
        >
          <p class="text-sm text-secondary-500 mb-2">{{ t('ticket.tags') }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in ticketStore.currentTicket.tags"
              :key="tag.id"
              class="px-2.5 py-1 text-xs font-medium rounded-full"
              :style="{
                backgroundColor: tag.color_code || '#e5e7eb',
                color: tag.color_code ? '#fff' : '#374151',
              }"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="border-t border-secondary-200 pt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-secondary-500">
          <p>{{ t('ticket.createdAt') }}: {{ formatDate(ticketStore.currentTicket.created_at) }}</p>
          <p>{{ t('ticket.updatedAt') }}: {{ formatDate(ticketStore.currentTicket.updated_at) }}</p>
        </div>
      </div>

      <!-- Entries section -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h2 class="text-lg font-semibold text-secondary-900 mb-4">
          {{ t('ticket.entries') }}
        </h2>

        <!-- Empty entries -->
        <div
          v-if="!ticketStore.currentTicket.entries || ticketStore.currentTicket.entries.length === 0"
          class="text-center py-8"
        >
          <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-secondary-500">{{ t('ticket.noEntries') }}</p>
        </div>

        <!-- Entry list -->
        <div v-else class="space-y-4">
          <div
            v-for="entry in ticketStore.currentTicket.entries"
            :key="entry.id"
            class="border border-secondary-200 rounded-lg p-4"
          >
            <div class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-secondary-900">
                  {{ getUserName(entry.author_user_name) }}
                </span>
                <span class="px-2 py-0.5 text-xs bg-secondary-100 text-secondary-600 rounded-full">
                  {{ t(`ticket.entryTypes.${entry.entry_type}`) }}
                </span>
              </div>
              <span class="text-xs text-secondary-500 shrink-0">
                {{ formatDate(entry.created_at) }}
              </span>
            </div>

            <!-- Entry content based on type -->
            <div v-if="entry.entry_type === 'COMMENT'">
              <!-- Comment body with format-aware rendering -->
              <div
                v-if="entry.format === 'HTML'"
                class="prose prose-sm max-w-none text-secondary-700"
                v-html="entry.body"
              />
              <div
                v-else-if="entry.format === 'MARKDOWN'"
                class="prose prose-sm max-w-none text-secondary-700"
                v-html="entry.body"
              />
              <pre
                v-else
                class="text-secondary-700 whitespace-pre-wrap font-sans text-sm m-0"
              >{{ entry.body }}</pre>
            </div>

            <!-- File entry -->
            <div v-else-if="entry.entry_type === 'FILE'" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary-900">
                  {{ entry.payload?.filename || 'File' }}
                </p>
                <p v-if="entry.payload?.size" class="text-xs text-secondary-500">
                  {{ entry.payload.size }}
                </p>
              </div>
              <a
                v-if="entry.payload?.public_id"
                :href="`/api/files/${entry.payload.public_id}/download`"
                target="_blank"
                download
                class="px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {{ t('common.download') }}
              </a>
            </div>

            <!-- Schedule entry -->
            <div v-else-if="entry.entry_type === 'SCHEDULE'" class="space-y-2">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-medium text-secondary-900">
                  {{ entry.payload?.title || t('ticket.entryTypes.SCHEDULE') }}
                </span>
              </div>
              <div class="pl-7 space-y-1 text-sm text-secondary-600">
                <p v-if="entry.payload?.start_date">
                  <span class="font-medium">{{ t('ticket.entryForm.startDate') }}:</span>
                  {{ formatDate(entry.payload.start_date as string) }}
                </p>
                <p v-if="entry.payload?.end_date">
                  <span class="font-medium">{{ t('ticket.entryForm.endDate') }}:</span>
                  {{ formatDate(entry.payload.end_date as string) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Add entry form -->
        <div class="mt-6 pt-6 border-t border-secondary-200">
          <h3 class="text-sm font-medium text-secondary-700 mb-4">
            {{ t('ticket.addEntry') }}
          </h3>
          <EntryTypeSelector
            :disabled="ticketStore.loading"
            :loading="ticketStore.loading"
            @submit="handleEntrySubmit"
          />
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-secondary-900">
            {{ t('ticket.deleteConfirmTitle') }}
          </h3>
        </div>
        <p class="text-secondary-600 mb-6">
          {{ t('ticket.deleteConfirmMessage') }}
        </p>
        <div class="flex justify-end gap-3">
          <KcButton variant="outline" @click="showDeleteConfirm = false">
            {{ t('common.cancel') }}
          </KcButton>
          <KcButton variant="danger" @click="deleteTicket">
            {{ t('common.delete') }}
          </KcButton>
        </div>
      </div>
    </div>
  </div>
</template>
