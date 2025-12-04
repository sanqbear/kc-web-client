<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import { KcButton, KcSelect, KcEditor } from '@/components/ui'
import type { SelectOption } from '@/components/ui/KcSelect.vue'
import type { EditorFormat } from '@/components/ui/KcEditor.vue'
import type {
  TicketStatus,
  TicketPriority,
  TicketRequestType,
  ContentFormat,
} from '@/types/ticket'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const isEditMode = computed(() => !!route.params.id)
const ticketId = computed(() => route.params.id as string)

const title = ref('')
const status = ref<TicketStatus>('OPEN')
const priority = ref<TicketPriority>('MEDIUM')
const requestType = ref<TicketRequestType>('GENERAL_INQUIRY')
const dueDate = ref('')
const bodyContent = ref('')
const bodyFormat = ref<EditorFormat>('PLAIN_TEXT')

// EditorFormat to ContentFormat mapping
function toContentFormat(format: EditorFormat): ContentFormat {
  return format as ContentFormat
}

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'OPEN', label: t('ticket.statusValues.OPEN') },
  { value: 'WAITING_FOR_INFO', label: t('ticket.statusValues.WAITING_FOR_INFO') },
  { value: 'IN_PROGRESS', label: t('ticket.statusValues.IN_PROGRESS') },
  { value: 'RESOLVED', label: t('ticket.statusValues.RESOLVED') },
  { value: 'CLOSED', label: t('ticket.statusValues.CLOSED') },
  { value: 'REOPENED', label: t('ticket.statusValues.REOPENED') },
])

const priorityOptions = computed<SelectOption[]>(() => [
  { value: 'LOW', label: t('ticket.priorityValues.LOW') },
  { value: 'MEDIUM', label: t('ticket.priorityValues.MEDIUM') },
  { value: 'HIGH', label: t('ticket.priorityValues.HIGH') },
  { value: 'CRITICAL', label: t('ticket.priorityValues.CRITICAL') },
])

const requestTypeOptions = computed<SelectOption[]>(() => [
  { value: 'BUG', label: t('ticket.requestTypeValues.BUG') },
  { value: 'MAINTENANCE', label: t('ticket.requestTypeValues.MAINTENANCE') },
  { value: 'FEATURE_REQUEST', label: t('ticket.requestTypeValues.FEATURE_REQUEST') },
  { value: 'GENERAL_INQUIRY', label: t('ticket.requestTypeValues.GENERAL_INQUIRY') },
])

onMounted(async () => {
  if (isEditMode.value) {
    const success = await ticketStore.fetchTicket(ticketId.value)
    if (success && ticketStore.currentTicket) {
      title.value = ticketStore.currentTicket.title
      status.value = ticketStore.currentTicket.status
      priority.value = ticketStore.currentTicket.priority
      requestType.value = ticketStore.currentTicket.request_type
      if (ticketStore.currentTicket.due_date) {
        const datePart = ticketStore.currentTicket.due_date.split('T')[0]
        dueDate.value = datePart ?? ''
      }
    }
  }
})

function goBack() {
  if (isEditMode.value) {
    router.push({ name: 'ticket-detail', params: { id: ticketId.value } })
  } else {
    router.push({ name: 'tickets' })
  }
}

async function handleSubmit() {
  if (isEditMode.value) {
    const success = await ticketStore.updateTicket(ticketId.value, {
      title: title.value,
      status: status.value,
      priority: priority.value,
      request_type: requestType.value,
      due_date: dueDate.value ? new Date(dueDate.value).toISOString() : undefined,
    })
    if (success) {
      router.push({ name: 'ticket-detail', params: { id: ticketId.value } })
    }
  } else {
    if (!title.value.trim() || !bodyContent.value.trim()) {
      return
    }
    const ticket = await ticketStore.createTicket({
      title: title.value,
      status: status.value,
      priority: priority.value,
      request_type: requestType.value,
      due_date: dueDate.value ? new Date(dueDate.value).toISOString() : undefined,
      initial_entry: {
        body: bodyContent.value,
        entry_type: 'COMMENT',
        format: toContentFormat(bodyFormat.value),
      },
    })
    if (ticket) {
      router.push({ name: 'ticket-detail', params: { id: ticket.id } })
    }
  }
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
      <h1 class="text-2xl font-bold text-secondary-900">
        {{ isEditMode ? t('ticket.edit') : t('ticket.create') }}
      </h1>
    </div>

    <!-- Form card -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-secondary-700 mb-1">
            {{ t('ticket.title') }} <span class="text-danger-500">*</span>
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            :placeholder="t('ticket.titlePlaceholder')"
          />
        </div>

        <!-- Status, Priority, Request Type grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KcSelect
            v-model="status"
            :label="t('ticket.status')"
            :options="statusOptions"
          />

          <KcSelect
            v-model="priority"
            :label="t('ticket.priority')"
            :options="priorityOptions"
          />

          <KcSelect
            v-model="requestType"
            :label="t('ticket.requestType')"
            :options="requestTypeOptions"
          />
        </div>

        <!-- Due Date -->
        <div>
          <label for="dueDate" class="block text-sm font-medium text-secondary-700 mb-1">
            {{ t('ticket.dueDate') }}
          </label>
          <input
            id="dueDate"
            v-model="dueDate"
            type="date"
            class="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>

        <!-- Body (only for create mode) -->
        <KcEditor
          v-if="!isEditMode"
          v-model="bodyContent"
          :format="bodyFormat"
          :label="t('ticket.body')"
          :placeholder="t('ticket.bodyPlaceholder')"
          :rows="8"
          required
          @update:format="bodyFormat = $event"
        />

        <!-- Error message -->
        <div v-if="ticketStore.error" class="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p class="text-sm text-danger-600">{{ ticketStore.error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-secondary-200">
          <KcButton variant="outline" @click="goBack">
            {{ t('common.cancel') }}
          </KcButton>
          <KcButton type="submit" :loading="ticketStore.loading">
            {{ ticketStore.loading ? t('common.loading') : t('common.save') }}
          </KcButton>
        </div>
      </form>
    </div>
  </div>
</template>
