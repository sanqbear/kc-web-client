<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { KcEditor } from '@/components/ui'
import type { EditorFormat } from '@/components/ui/KcEditor.vue'
import type { EntryType } from '@/types/ticket'

export interface EntryFormData {
  entryType: EntryType
  body: string
  format: EditorFormat
  file: File | null
  scheduleTitle: string
  scheduleStartDate: string
  scheduleEndDate: string
}

interface Props {
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: EntryFormData]
}>()

const { t } = useI18n()

const selectedType = ref<'COMMENT' | 'FILE' | 'SCHEDULE'>('COMMENT')
const commentBody = ref('')
const commentFormat = ref<EditorFormat>('PLAIN_TEXT')
const selectedFile = ref<File | null>(null)
const scheduleTitle = ref('')
const scheduleStartDate = ref('')
const scheduleEndDate = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement>()

const canSubmit = computed(() => {
  if (props.disabled || props.loading) return false

  switch (selectedType.value) {
    case 'COMMENT':
      return commentBody.value.trim().length > 0
    case 'FILE':
      return selectedFile.value !== null
    case 'SCHEDULE':
      return scheduleTitle.value.trim().length > 0 &&
             scheduleStartDate.value.length > 0 &&
             scheduleEndDate.value.length > 0
    default:
      return false
  }
})

function handleSubmit() {
  if (!canSubmit.value) return

  const data: EntryFormData = {
    entryType: selectedType.value,
    body: commentBody.value,
    format: commentFormat.value,
    file: selectedFile.value,
    scheduleTitle: scheduleTitle.value,
    scheduleStartDate: scheduleStartDate.value,
    scheduleEndDate: scheduleEndDate.value,
  }

  emit('submit', data)
  resetForm()
}

function resetForm() {
  commentBody.value = ''
  commentFormat.value = 'PLAIN_TEXT'
  selectedFile.value = null
  scheduleTitle.value = ''
  scheduleStartDate.value = ''
  scheduleEndDate.value = ''
}

function selectType(type: 'COMMENT' | 'FILE' | 'SCHEDULE') {
  selectedType.value = type
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    selectedFile.value = e.dataTransfer.files[0]
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function removeFile() {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<template>
  <div class="entry-type-selector">
    <!-- Type tabs -->
    <div class="flex items-center gap-1 mb-4 pb-3 border-b border-secondary-200">
      <button
        type="button"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          selectedType === 'COMMENT'
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        ]"
        @click="selectType('COMMENT')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {{ t('ticket.entryForm.comment') }}
      </button>

      <button
        type="button"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          selectedType === 'FILE'
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        ]"
        @click="selectType('FILE')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        {{ t('ticket.entryForm.file') }}
      </button>

      <button
        type="button"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          selectedType === 'SCHEDULE'
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        ]"
        @click="selectType('SCHEDULE')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ t('ticket.entryForm.schedule') }}
      </button>
    </div>

    <!-- Content area -->
    <div class="mb-4">
      <!-- Comment editor -->
      <div v-if="selectedType === 'COMMENT'">
        <KcEditor
          v-model="commentBody"
          v-model:format="commentFormat"
          :placeholder="t('ticket.entryPlaceholder')"
          :disabled="disabled"
          :rows="5"
        />
      </div>

      <!-- File upload -->
      <div v-else-if="selectedType === 'FILE'">
        <div
          v-if="!selectedFile"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50',
          ]"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @click="triggerFileInput"
        >
          <svg class="w-12 h-12 mx-auto mb-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm font-medium text-secondary-700 mb-1">
            {{ t('ticket.entryForm.uploadFile') }}
          </p>
          <p class="text-xs text-secondary-500">
            {{ t('ticket.entryForm.dragOrClick') }}
          </p>
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <div
          v-else
          class="border border-secondary-300 rounded-lg p-4 bg-secondary-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="ml-3 p-1 rounded hover:bg-secondary-200 text-secondary-500 hover:text-secondary-700 transition-colors"
              @click="removeFile"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Schedule form -->
      <div v-else-if="selectedType === 'SCHEDULE'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1.5">
            {{ t('ticket.entryForm.scheduleTitle') }}
            <span class="text-danger-500 ml-0.5">*</span>
          </label>
          <input
            v-model="scheduleTitle"
            type="text"
            :placeholder="t('ticket.entryForm.scheduleTitlePlaceholder')"
            :disabled="disabled"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-sm"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1.5">
              {{ t('ticket.entryForm.startDate') }}
              <span class="text-danger-500 ml-0.5">*</span>
            </label>
            <input
              v-model="scheduleStartDate"
              type="datetime-local"
              :disabled="disabled"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1.5">
              {{ t('ticket.entryForm.endDate') }}
              <span class="text-danger-500 ml-0.5">*</span>
            </label>
            <input
              v-model="scheduleEndDate"
              type="datetime-local"
              :disabled="disabled"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Submit button -->
    <div class="flex justify-end">
      <button
        type="button"
        :disabled="!canSubmit"
        :class="[
          'px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2',
          canSubmit
            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
            : 'bg-secondary-200 text-secondary-400 cursor-not-allowed',
        ]"
        @click="handleSubmit"
      >
        <svg
          v-if="loading"
          class="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ loading ? t('ticket.entryForm.uploading') : t('ticket.submitEntry') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.entry-type-selector {
  /* Component container styles */
}
</style>
