<script setup lang="ts">
import { computed, useId } from 'vue'

export interface Props {
  /** input 타입 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** v-model 값 */
  modelValue?: string | number
  /** 라벨 텍스트 */
  label?: string
  /** placeholder */
  placeholder?: string
  /** 에러 메시지 (표시되면 에러 스타일 적용) */
  error?: string
  /** 힌트 메시지 */
  hint?: string
  /** 필수 입력 여부 */
  required?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 읽기 전용 */
  readonly?: boolean
  /** 전체 너비 */
  fullWidth?: boolean
  /** 입력 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 좌측 아이콘 슬롯 사용 여부 표시용 (실제 아이콘은 slot으로) */
  hasLeadingIcon?: boolean
  /** 우측 아이콘 슬롯 사용 여부 표시용 */
  hasTrailingIcon?: boolean
  /** autocomplete 속성 */
  autocomplete?: string
  /** 최대 길이 */
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  required: false,
  disabled: false,
  readonly: false,
  fullWidth: true,
  size: 'md',
  hasLeadingIcon: false,
  hasTrailingIcon: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputId = useId()

const hasError = computed(() => !!props.error)

const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      label: 'text-xs',
      icon: 'h-4 w-4',
    },
    md: {
      input: 'px-3 py-2 text-sm',
      label: 'text-sm',
      icon: 'h-5 w-5',
    },
    lg: {
      input: 'px-4 py-3 text-base',
      label: 'text-base',
      icon: 'h-5 w-5',
    },
  }
  return sizes[props.size]
})

const inputClasses = computed(() => {
  const base = [
    'block',
    'w-full',
    'rounded-lg',
    'border',
    'bg-white',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    sizeClasses.value.input,
  ]

  // 에러 상태
  if (hasError.value) {
    base.push(
      'border-danger-300',
      'text-danger-900',
      'placeholder:text-danger-300',
      'focus:border-danger-500',
      'focus:ring-danger-500/20',
    )
  } else {
    base.push(
      'border-secondary-300',
      'text-secondary-900',
      'placeholder:text-secondary-400',
      'focus:border-primary-500',
      'focus:ring-primary-500/20',
    )
  }

  // 비활성화 상태
  if (props.disabled) {
    base.push('bg-secondary-50', 'cursor-not-allowed', 'opacity-60')
  }

  // 읽기 전용 상태
  if (props.readonly) {
    base.push('bg-secondary-50')
  }

  // 아이콘 패딩
  if (props.hasLeadingIcon) {
    base.push('pl-10')
  }
  if (props.hasTrailingIcon) {
    base.push('pr-10')
  }

  return base.join(' ')
})

const labelClasses = computed(() => {
  const base = ['block', 'font-medium', 'mb-1.5', sizeClasses.value.label]

  if (hasError.value) {
    base.push('text-danger-700')
  } else {
    base.push('text-secondary-700')
  }

  return base.join(' ')
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <div :class="['kc-input', { 'w-full': fullWidth }]">
    <!-- 라벨 -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Leading icon slot -->
      <div
        v-if="$slots['leading-icon'] || hasLeadingIcon"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        :class="hasError ? 'text-danger-400' : 'text-secondary-400'"
      >
        <slot name="leading-icon" />
      </div>

      <!-- Input element -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Trailing icon slot -->
      <div
        v-if="$slots['trailing-icon'] || hasTrailingIcon"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
        :class="hasError ? 'text-danger-400' : 'text-secondary-400'"
      >
        <slot name="trailing-icon" />
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
