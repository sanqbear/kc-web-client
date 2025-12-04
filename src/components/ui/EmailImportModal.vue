<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { ewsApi, ApiError } from '@/utils/api'
import type { EmailListItem, EmailDetail } from '@/types/ews'
import KcButton from './KcButton.vue'
import KcSelect from './KcSelect.vue'
import type { SelectOption } from './KcSelect.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  import: [data: { title: string; body: string; bodyType: 'HTML' | 'Text' }]
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const step = ref<'settings' | 'list' | 'detail'>('settings')
const loading = ref(false)
const error = ref<string | null>(null)
const emails = ref<EmailListItem[]>([])
const selectedEmail = ref<EmailDetail | null>(null)
const total = ref(0)
const offset = ref(0)
const limit = 20

// Mailbox settings
const mailboxInput = ref('')
const selectedFolder = ref('inbox')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const hasMore = computed(() => offset.value + emails.value.length < total.value)
const hasPrev = computed(() => offset.value > 0)

// Well-known folder options
const folderOptions = computed<SelectOption[]>(() => [
  { value: 'inbox', label: t('ews.folders.inbox') },
  { value: 'sentitems', label: t('ews.folders.sentItems') },
  { value: 'drafts', label: t('ews.folders.drafts') },
  { value: 'deleteditems', label: t('ews.folders.deletedItems') },
  { value: 'junkemail', label: t('ews.folders.junkEmail') },
  { value: 'outbox', label: t('ews.folders.outbox') },
])

// Watch for modal open to reset state
watch(isOpen, (newValue) => {
  if (newValue) {
    // Set default mailbox from user email
    mailboxInput.value = authStore.user?.email || ''
    selectedFolder.value = 'inbox'
    step.value = 'settings'
    emails.value = []
    selectedEmail.value = null
    error.value = null
    offset.value = 0
    total.value = 0
  }
})

function proceedToList() {
  if (!mailboxInput.value.trim()) {
    error.value = t('ews.noMailbox')
    return
  }
  error.value = null
  fetchEmails(0)
}

async function fetchEmails(newOffset = 0) {
  loading.value = true
  error.value = null
  offset.value = newOffset

  try {
    const response = await ewsApi.listEmails(
      mailboxInput.value.trim(),
      selectedFolder.value,
      limit,
      newOffset,
    )
    emails.value = response.emails
    total.value = response.total
    step.value = 'list'
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 503) {
        error.value = t('ews.serviceUnavailable')
      } else {
        error.value = e.message
      }
    } else {
      error.value = t('common.error')
    }
  } finally {
    loading.value = false
  }
}

async function selectEmail(email: EmailListItem) {
  loading.value = true
  error.value = null

  try {
    const response = await ewsApi.getEmailDetail(mailboxInput.value.trim(), email.item_id)
    selectedEmail.value = response.email
    step.value = 'detail'
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = e.message
    } else {
      error.value = t('common.error')
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (step.value === 'detail') {
    step.value = 'list'
    selectedEmail.value = null
  } else if (step.value === 'list') {
    step.value = 'settings'
    emails.value = []
    offset.value = 0
    total.value = 0
  }
  error.value = null
}

function confirmImport() {
  if (!selectedEmail.value) return

  emit('import', {
    title: selectedEmail.value.subject,
    body: selectedEmail.value.body,
    bodyType: selectedEmail.value.body_type,
  })
  closeModal()
}

function closeModal() {
  isOpen.value = false
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function loadMore() {
  fetchEmails(offset.value + limit)
}

function loadPrev() {
  fetchEmails(Math.max(0, offset.value - limit))
}

function getStepTitle() {
  switch (step.value) {
    case 'settings':
      return t('ews.mailboxSettings')
    case 'list':
      return t('ews.selectEmail')
    case 'detail':
      return t('ews.emailDetail')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeModal"
        />

        <!-- Modal -->
        <div
          class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center gap-2">
              <button
                v-if="step !== 'settings'"
                type="button"
                class="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
                @click="goBack"
              >
                <svg class="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 class="text-lg font-semibold text-secondary-900">
                {{ getStepTitle() }}
              </h2>
            </div>
            <button
              type="button"
              class="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              @click="closeModal"
            >
              <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Error -->
            <div
              v-if="error"
              class="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-600"
            >
              {{ error }}
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <svg class="animate-spin w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <!-- Mailbox Settings -->
            <div v-else-if="step === 'settings'" class="space-y-6">
              <div>
                <label for="mailbox" class="block text-sm font-medium text-secondary-700 mb-1">
                  {{ t('ews.mailboxAddress') }}
                </label>
                <input
                  id="mailbox"
                  v-model="mailboxInput"
                  type="email"
                  class="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  :placeholder="t('ews.mailboxPlaceholder')"
                />
                <p class="mt-1 text-xs text-secondary-500">
                  {{ t('ews.mailboxHint') }}
                </p>
              </div>

              <KcSelect
                v-model="selectedFolder"
                :label="t('ews.folder')"
                :options="folderOptions"
              />
            </div>

            <!-- Email List -->
            <div v-else-if="step === 'list'">
              <div v-if="emails.length === 0" class="text-center py-12 text-secondary-500">
                {{ t('ews.noEmails') }}
              </div>

              <div v-else class="space-y-2">
                <button
                  v-for="email in emails"
                  :key="email.item_id"
                  type="button"
                  class="w-full text-left p-4 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                  :class="{ 'bg-secondary-50': email.is_read }"
                  @click="selectEmail(email)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span
                          v-if="!email.is_read"
                          class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"
                        />
                        <span class="font-medium text-secondary-900 truncate">
                          {{ email.subject || t('ews.noSubject') }}
                        </span>
                        <svg
                          v-if="email.has_attachments"
                          class="w-4 h-4 text-secondary-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div class="text-sm text-secondary-600 mt-1">
                        {{ email.from }} &lt;{{ email.from_email }}&gt;
                      </div>
                      <div v-if="email.preview" class="text-sm text-secondary-500 mt-1 truncate">
                        {{ email.preview }}
                      </div>
                    </div>
                    <div class="text-xs text-secondary-400 flex-shrink-0">
                      {{ formatDate(email.received_date) }}
                    </div>
                  </div>
                </button>
              </div>

              <!-- Pagination -->
              <div v-if="emails.length > 0" class="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
                <KcButton
                  variant="outline"
                  size="sm"
                  :disabled="!hasPrev"
                  @click="loadPrev"
                >
                  {{ t('common.prev') }}
                </KcButton>
                <span class="text-sm text-secondary-500">
                  {{ offset + 1 }} - {{ offset + emails.length }} / {{ total }}
                </span>
                <KcButton
                  variant="outline"
                  size="sm"
                  :disabled="!hasMore"
                  @click="loadMore"
                >
                  {{ t('common.next') }}
                </KcButton>
              </div>
            </div>

            <!-- Email Detail -->
            <div v-else-if="step === 'detail' && selectedEmail">
              <div class="space-y-4">
                <!-- Subject -->
                <div>
                  <label class="block text-xs font-medium text-secondary-500 mb-1">
                    {{ t('ews.subject') }}
                  </label>
                  <div class="text-lg font-medium text-secondary-900">
                    {{ selectedEmail.subject || t('ews.noSubject') }}
                  </div>
                </div>

                <!-- From -->
                <div>
                  <label class="block text-xs font-medium text-secondary-500 mb-1">
                    {{ t('ews.from') }}
                  </label>
                  <div class="text-secondary-700">
                    {{ selectedEmail.from.name }} &lt;{{ selectedEmail.from.address }}&gt;
                  </div>
                </div>

                <!-- To -->
                <div v-if="selectedEmail.to_recipients?.length">
                  <label class="block text-xs font-medium text-secondary-500 mb-1">
                    {{ t('ews.to') }}
                  </label>
                  <div class="text-secondary-700">
                    {{ selectedEmail.to_recipients.map(r => `${r.name} <${r.address}>`).join(', ') }}
                  </div>
                </div>

                <!-- Date -->
                <div>
                  <label class="block text-xs font-medium text-secondary-500 mb-1">
                    {{ t('ews.receivedDate') }}
                  </label>
                  <div class="text-secondary-700">
                    {{ formatDate(selectedEmail.received_date) }}
                  </div>
                </div>

                <!-- Body Preview -->
                <div>
                  <label class="block text-xs font-medium text-secondary-500 mb-1">
                    {{ t('ews.body') }}
                  </label>
                  <div
                    class="p-4 bg-secondary-50 rounded-lg border border-secondary-200 max-h-64 overflow-y-auto"
                  >
                    <div
                      v-if="selectedEmail.body_type === 'HTML'"
                      class="prose prose-sm max-w-none"
                      v-html="selectedEmail.body"
                    />
                    <pre v-else class="whitespace-pre-wrap text-sm text-secondary-700">{{ selectedEmail.body }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-secondary-200">
            <KcButton variant="outline" @click="closeModal">
              {{ t('common.cancel') }}
            </KcButton>
            <KcButton
              v-if="step === 'settings'"
              :disabled="!mailboxInput.trim()"
              @click="proceedToList"
            >
              {{ t('common.next') }}
            </KcButton>
            <KcButton
              v-if="step === 'detail' && selectedEmail"
              @click="confirmImport"
            >
              {{ t('ews.import') }}
            </KcButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
