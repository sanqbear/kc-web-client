<script setup lang="ts">
import { computed, ref, watch, useId, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { marked } from 'marked'

export type EditorFormat = 'PLAIN_TEXT' | 'MARKDOWN' | 'HTML'

export interface Props {
  /** v-model 값 */
  modelValue?: string
  /** 포맷 타입 */
  format?: EditorFormat
  /** 라벨 텍스트 */
  label?: string
  /** placeholder */
  placeholder?: string
  /** 에러 메시지 */
  error?: string
  /** 힌트 메시지 */
  hint?: string
  /** 필수 입력 여부 */
  required?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 전체 너비 */
  fullWidth?: boolean
  /** 최소 높이 (rows) */
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  format: 'PLAIN_TEXT',
  required: false,
  disabled: false,
  fullWidth: true,
  rows: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:format': [format: EditorFormat]
}>()

const editorId = useId()
const showMarkdownPreview = ref(false)

const hasError = computed(() => !!props.error)

const minHeight = computed(() => `${props.rows * 1.5}rem`)

// Tiptap editor for HTML mode
const editor = useEditor({
  content: props.format === 'HTML' ? props.modelValue : '',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || '',
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  editable: !props.disabled,
  onUpdate: ({ editor: ed }) => {
    if (props.format === 'HTML') {
      emit('update:modelValue', ed.getHTML())
    }
  },
})

// Watch for format changes
watch(
  () => props.format,
  (newFormat, oldFormat) => {
    if (newFormat === 'HTML' && oldFormat !== 'HTML') {
      editor.value?.commands.setContent(props.modelValue || '')
    }
  },
)

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.format === 'HTML' && editor.value) {
      const currentContent = editor.value.getHTML()
      if (newValue !== currentContent) {
        editor.value.commands.setContent(newValue || '')
      }
    }
  },
)

// Watch disabled state
watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Markdown preview
const markdownHtml = computed(() => {
  if (props.format === 'MARKDOWN' && props.modelValue) {
    return marked(props.modelValue)
  }
  return ''
})

function handleTextInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function changeFormat(newFormat: EditorFormat) {
  emit('update:format', newFormat)
  if (newFormat !== 'MARKDOWN') {
    showMarkdownPreview.value = false
  }
}

function toggleMarkdownPreview() {
  showMarkdownPreview.value = !showMarkdownPreview.value
}

// Tiptap toolbar actions
function toggleBold() {
  editor.value?.chain().focus().toggleBold().run()
}
function toggleItalic() {
  editor.value?.chain().focus().toggleItalic().run()
}
function toggleStrike() {
  editor.value?.chain().focus().toggleStrike().run()
}
function toggleCode() {
  editor.value?.chain().focus().toggleCode().run()
}
function toggleHeading(level: 1 | 2 | 3) {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}
function toggleBulletList() {
  editor.value?.chain().focus().toggleBulletList().run()
}
function toggleOrderedList() {
  editor.value?.chain().focus().toggleOrderedList().run()
}
function toggleBlockquote() {
  editor.value?.chain().focus().toggleBlockquote().run()
}
function toggleCodeBlock() {
  editor.value?.chain().focus().toggleCodeBlock().run()
}
function setLink() {
  const url = window.prompt('URL:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}
function unsetLink() {
  editor.value?.chain().focus().unsetLink().run()
}

const labelClasses = computed(() => {
  const base = ['block', 'font-medium', 'mb-1.5', 'text-sm']
  if (hasError.value) {
    base.push('text-danger-700')
  } else {
    base.push('text-secondary-700')
  }
  return base.join(' ')
})

const editorWrapperClasses = computed(() => {
  const base = [
    'rounded-lg',
    'border',
    'bg-white',
    'transition-colors',
    'duration-200',
    'overflow-hidden',
  ]

  if (hasError.value) {
    base.push('border-danger-300', 'focus-within:border-danger-500', 'focus-within:ring-2', 'focus-within:ring-danger-500/20')
  } else {
    base.push('border-secondary-300', 'focus-within:border-primary-500', 'focus-within:ring-2', 'focus-within:ring-primary-500/20')
  }

  if (props.disabled) {
    base.push('bg-secondary-50', 'opacity-60')
  }

  return base.join(' ')
})

const textareaClasses = computed(() => {
  const base = [
    'block',
    'w-full',
    'px-3',
    'py-2',
    'text-sm',
    'text-secondary-900',
    'placeholder:text-secondary-400',
    'focus:outline-none',
    'resize-none',
    'bg-transparent',
  ]

  if (props.disabled) {
    base.push('cursor-not-allowed')
  }

  return base.join(' ')
})

const formatOptions: { value: EditorFormat; label: string }[] = [
  { value: 'PLAIN_TEXT', label: 'Text' },
  { value: 'MARKDOWN', label: 'Markdown' },
  { value: 'HTML', label: 'HTML' },
]
</script>

<template>
  <div :class="['kc-editor', { 'w-full': fullWidth }]">
    <!-- 라벨 -->
    <label v-if="label" :id="`${editorId}-label`" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>

    <!-- Editor wrapper -->
    <div :class="editorWrapperClasses">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-2 py-1.5 border-b border-secondary-200 bg-secondary-50">
        <!-- Format selector -->
        <div class="flex items-center gap-1">
          <button
            v-for="opt in formatOptions"
            :key="opt.value"
            type="button"
            :class="[
              'px-2 py-1 text-xs rounded transition-colors',
              format === opt.value
                ? 'bg-primary-500 text-white'
                : 'text-secondary-600 hover:bg-secondary-200',
            ]"
            @click="changeFormat(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Markdown preview toggle -->
        <button
          v-if="format === 'MARKDOWN'"
          type="button"
          class="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
          :class="showMarkdownPreview ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:bg-secondary-200'"
          @click="toggleMarkdownPreview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>

        <!-- HTML toolbar -->
        <div v-if="format === 'HTML'" class="flex items-center gap-0.5">
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('bold') }"
            title="Bold"
            @click="toggleBold"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('italic') }"
            title="Italic"
            @click="toggleItalic"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8" transform="skewX(-10)" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('strike') }"
            title="Strikethrough"
            @click="toggleStrike"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5v14" />
            </svg>
          </button>
          <div class="w-px h-4 bg-secondary-300 mx-1" />
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors text-xs font-bold"
            :class="{ 'bg-secondary-300': editor?.isActive('heading', { level: 1 }) }"
            title="Heading 1"
            @click="toggleHeading(1)"
          >
            H1
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors text-xs font-bold"
            :class="{ 'bg-secondary-300': editor?.isActive('heading', { level: 2 }) }"
            title="Heading 2"
            @click="toggleHeading(2)"
          >
            H2
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors text-xs font-bold"
            :class="{ 'bg-secondary-300': editor?.isActive('heading', { level: 3 }) }"
            title="Heading 3"
            @click="toggleHeading(3)"
          >
            H3
          </button>
          <div class="w-px h-4 bg-secondary-300 mx-1" />
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('bulletList') }"
            title="Bullet List"
            @click="toggleBulletList"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('orderedList') }"
            title="Ordered List"
            @click="toggleOrderedList"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13M4 6v.01M4 12v.01M4 18v.01" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('blockquote') }"
            title="Quote"
            @click="toggleBlockquote"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <div class="w-px h-4 bg-secondary-300 mx-1" />
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('code') }"
            title="Inline Code"
            @click="toggleCode"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('codeBlock') }"
            title="Code Block"
            @click="toggleCodeBlock"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-secondary-200 transition-colors"
            :class="{ 'bg-secondary-300': editor?.isActive('link') }"
            title="Link"
            @click="editor?.isActive('link') ? unsetLink() : setLink()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div class="relative">
        <!-- Plain text / Markdown textarea -->
        <textarea
          v-if="format === 'PLAIN_TEXT' || (format === 'MARKDOWN' && !showMarkdownPreview)"
          :id="editorId"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          :class="textareaClasses"
          :style="{ minHeight }"
          @input="handleTextInput"
        />

        <!-- Markdown preview -->
        <div
          v-else-if="format === 'MARKDOWN' && showMarkdownPreview"
          class="px-3 py-2 prose prose-sm max-w-none overflow-auto"
          :style="{ minHeight }"
          v-html="markdownHtml"
        />

        <!-- HTML editor (Tiptap) -->
        <EditorContent
          v-else-if="format === 'HTML'"
          :editor="editor"
          class="kc-editor-content"
          :style="{ minHeight }"
        />
      </div>
    </div>

    <!-- 에러 메시지 -->
    <p v-if="error" class="mt-1.5 text-sm text-danger-600">
      {{ error }}
    </p>

    <!-- 힌트 메시지 -->
    <p v-else-if="hint" class="mt-1.5 text-sm text-secondary-500">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
/* Tiptap editor styles */
.kc-editor-content :deep(.tiptap) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-secondary-900);
  outline: none;
}

.kc-editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  color: var(--color-secondary-400);
  float: left;
  height: 0;
  pointer-events: none;
  content: attr(data-placeholder);
}

.kc-editor-content :deep(.tiptap h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.kc-editor-content :deep(.tiptap h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.kc-editor-content :deep(.tiptap h3) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.kc-editor-content :deep(.tiptap ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}

.kc-editor-content :deep(.tiptap ol) {
  list-style-type: decimal;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}

.kc-editor-content :deep(.tiptap blockquote) {
  border-left: 4px solid var(--color-secondary-300);
  padding-left: 1rem;
  font-style: italic;
  color: var(--color-secondary-600);
  margin: 0.5rem 0;
}

.kc-editor-content :deep(.tiptap code) {
  background-color: var(--color-secondary-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
}

.kc-editor-content :deep(.tiptap pre) {
  background-color: var(--color-secondary-800);
  color: var(--color-secondary-100);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.kc-editor-content :deep(.tiptap pre code) {
  background-color: transparent;
  padding: 0;
}

.kc-editor-content :deep(.tiptap a) {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.kc-editor-content :deep(.tiptap p) {
  margin-bottom: 0.5rem;
}

/* Markdown preview prose styles */
.prose :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.prose :deep(ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}

.prose :deep(ol) {
  list-style-type: decimal;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--color-secondary-300);
  padding-left: 1rem;
  font-style: italic;
  color: var(--color-secondary-600);
  margin: 0.5rem 0;
}

.prose :deep(code) {
  background-color: var(--color-secondary-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
}

.prose :deep(pre) {
  background-color: var(--color-secondary-800);
  color: var(--color-secondary-100);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.prose :deep(a) {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.prose :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
