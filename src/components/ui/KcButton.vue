<script setup lang="ts">
import { computed } from 'vue'

export interface Props {
  /** 버튼 변형 스타일 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean
  /** 비활성화 상태 */
  disabled?: boolean
  /** 로딩 상태 */
  loading?: boolean
  /** 버튼 타입 */
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const baseClasses = [
  'inline-flex',
  'items-center',
  'justify-center',
  'font-medium',
  'rounded-md',
  'shadow-sm',
  'transition-colors',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
]

const variantClasses: Record<NonNullable<Props['variant']>, string[]> = {
  primary: [
    'text-white',
    'bg-primary-500',
    'hover:bg-primary-600',
    'focus:ring-primary-500',
    'border',
    'border-transparent',
  ],
  secondary: [
    'text-white',
    'bg-secondary-500',
    'hover:bg-secondary-600',
    'focus:ring-secondary-500',
    'border',
    'border-transparent',
  ],
  outline: [
    'text-secondary-700',
    'bg-white',
    'hover:bg-secondary-50',
    'focus:ring-primary-500',
    'border',
    'border-secondary-300',
  ],
  ghost: [
    'text-secondary-700',
    'bg-transparent',
    'hover:bg-secondary-100',
    'focus:ring-secondary-500',
    'border',
    'border-transparent',
    'shadow-none',
  ],
  danger: [
    'text-white',
    'bg-danger-500',
    'hover:bg-danger-600',
    'focus:ring-danger-500',
    'border',
    'border-transparent',
  ],
}

const sizeClasses: Record<NonNullable<Props['size']>, string[]> = {
  sm: ['text-xs', 'px-3', 'py-1.5'],
  md: ['text-sm', 'px-4', 'py-2'],
  lg: ['text-base', 'px-6', 'py-3'],
}

const disabledClasses = ['opacity-50', 'cursor-not-allowed']

const buttonClasses = computed(() => {
  const classes = [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...sizeClasses[props.size],
  ]

  if (props.fullWidth) {
    classes.push('w-full')
  }

  if (isDisabled.value) {
    classes.push(...disabledClasses)
  }

  return classes.join(' ')
})

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- 로딩 스피너 -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- 버튼 콘텐츠 -->
    <slot />
  </button>
</template>
