<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/ticket'
import type {
  TicketStatus,
  TicketPriority,
  TicketRequestType,
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
const initialEntryBody = ref('')

const statusOptions: TicketStatus[] = [
  'OPEN',
  'WAITING_FOR_INFO',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
]

const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const requestTypeOptions: TicketRequestType[] = [
  'BUG',
  'MAINTENANCE',
  'FEATURE_REQUEST',
  'GENERAL_INQUIRY',
]

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
    if (!title.value.trim() || !initialEntryBody.value.trim()) {
      return
    }
    const ticket = await ticketStore.createTicket({
      title: title.value,
      status: status.value,
      priority: priority.value,
      request_type: requestType.value,
      due_date: dueDate.value ? new Date(dueDate.value).toISOString() : undefined,
      initial_entry: {
        body: initialEntryBody.value,
        entry_type: 'COMMENT',
        format: 'PLAIN_TEXT',
      },
    })
    if (ticket) {
      router.push({ name: 'ticket-detail', params: { id: ticket.id } })
    }
  }
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

    <div class="bg-white shadow rounded-lg p-6 max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEditMode ? t('ticket.edit') : t('ticket.create') }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">
            {{ t('ticket.title') }} *
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('ticket.titlePlaceholder')"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">
              {{ t('ticket.status') }}
            </label>
            <select
              id="status"
              v-model="status"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="opt in statusOptions" :key="opt" :value="opt">
                {{ t(`ticket.statusValues.${opt}`) }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="priority"
              class="block text-sm font-medium text-gray-700"
            >
              {{ t('ticket.priority') }}
            </label>
            <select
              id="priority"
              v-model="priority"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="opt in priorityOptions" :key="opt" :value="opt">
                {{ t(`ticket.priorityValues.${opt}`) }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="requestType"
              class="block text-sm font-medium text-gray-700"
            >
              {{ t('ticket.requestType') }}
            </label>
            <select
              id="requestType"
              v-model="requestType"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="opt in requestTypeOptions"
                :key="opt"
                :value="opt"
              >
                {{ t(`ticket.requestTypeValues.${opt}`) }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label for="dueDate" class="block text-sm font-medium text-gray-700">
            {{ t('ticket.dueDate') }}
          </label>
          <input
            id="dueDate"
            v-model="dueDate"
            type="date"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div v-if="!isEditMode">
          <label
            for="initialEntry"
            class="block text-sm font-medium text-gray-700"
          >
            {{ t('ticket.initialEntry') }} *
          </label>
          <textarea
            id="initialEntry"
            v-model="initialEntryBody"
            rows="5"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('ticket.initialEntryPlaceholder')"
          ></textarea>
        </div>

        <div v-if="ticketStore.error" class="text-red-600 text-sm">
          {{ ticketStore.error }}
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="ticketStore.loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="ticketStore.loading">{{ t('common.loading') }}</span>
            <span v-else>{{ t('common.save') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
