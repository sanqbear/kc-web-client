<script setup lang="ts">
import {
  computed,
  ref,
  useId,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'

export interface SelectOption {
  /** 옵션 값 */
  value: string | number
  /** 옵션 레이블 */
  label: string
  /** 비활성화 여부 */
  disabled?: boolean
}

export interface Props {
  /** v-model 값 */
  modelValue?: string | number
  /** 옵션 목록 */
  options: SelectOption[]
  /** 라벨 텍스트 */
  label?: string
  /** placeholder (선택 안 했을 때 표시) */
  placeholder?: string
  /** 에러 메시지 (표시되면 에러 스타일 적용) */
  error?: string
  /** 힌트 메시지 */
  hint?: string
  /** 필수 선택 여부 */
  required?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 전체 너비 */
  fullWidth?: boolean
  /** 입력 크기 */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  required: false,
  disabled: false,
  fullWidth: true,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const selectId = useId()
const isOpen = ref(false)
const dropdownPosition = ref<'bottom' | 'top'>('bottom')
const highlightedIndex = ref(-1)

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const optionRefs = ref<(HTMLElement | null)[]>([])

const hasError = computed(() => !!props.error)

const selectedOption = computed(() =>
  props.options.find((opt) => opt.value === props.modelValue),
)

const displayText = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.label
  }
  return props.placeholder || ''
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      trigger: 'px-3 py-1.5 text-sm pr-8',
      label: 'text-xs',
      iconWrapper: 'right-0 pr-2',
      icon: 'h-4 w-4',
      option: 'px-3 py-1.5 text-sm',
    },
    md: {
      trigger: 'px-3 py-2 text-sm pr-10',
      label: 'text-sm',
      iconWrapper: 'right-0 pr-3',
      icon: 'h-5 w-5',
      option: 'px-3 py-2 text-sm',
    },
    lg: {
      trigger: 'px-4 py-3 text-base pr-12',
      label: 'text-base',
      iconWrapper: 'right-0 pr-4',
      icon: 'h-5 w-5',
      option: 'px-4 py-3 text-base',
    },
  }
  return sizes[props.size]
})

const triggerClasses = computed(() => {
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
    'cursor-pointer',
    'text-left',
    sizeClasses.value.trigger,
  ]

  if (hasError.value) {
    base.push(
      'border-danger-300',
      'text-danger-900',
      'focus:border-danger-500',
      'focus:ring-danger-500/20',
    )
  } else {
    base.push(
      'border-secondary-300',
      'text-secondary-900',
      'focus:border-primary-500',
      'focus:ring-primary-500/20',
    )
  }

  if (props.disabled) {
    base.push('bg-secondary-50', 'cursor-not-allowed', 'opacity-60')
  }

  if (isOpen.value) {
    base.push('ring-2', hasError.value ? 'ring-danger-500/20' : 'ring-primary-500/20')
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

const iconWrapperClasses = computed(() => {
  const base = [
    'absolute',
    'inset-y-0',
    'flex',
    'items-center',
    'pointer-events-none',
    'transition-transform',
    'duration-200',
    sizeClasses.value.iconWrapper,
  ]

  if (hasError.value) {
    base.push('text-danger-400')
  } else {
    base.push('text-secondary-400')
  }

  return base.join(' ')
})

const iconClasses = computed(() => {
  const base = [sizeClasses.value.icon, 'transition-transform', 'duration-200']
  if (isOpen.value) {
    base.push('rotate-180')
  }
  return base.join(' ')
})

const dropdownClasses = computed(() => {
  const base = [
    'absolute',
    'z-50',
    'w-full',
    'bg-white',
    'border',
    'border-secondary-200',
    'rounded-lg',
    'shadow-lg',
    'overflow-hidden',
    'max-h-60',
    'overflow-y-auto',
  ]

  if (dropdownPosition.value === 'top') {
    base.push('bottom-full', 'mb-1')
  } else {
    base.push('top-full', 'mt-1')
  }

  return base.join(' ')
})

function calculatePosition() {
  if (!triggerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const dropdownHeight = Math.min(240, props.options.length * 40)

  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    dropdownPosition.value = 'top'
  } else {
    dropdownPosition.value = 'bottom'
  }
}

function toggleDropdown() {
  if (props.disabled) return

  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  if (props.disabled) return

  calculatePosition()
  isOpen.value = true
  highlightedIndex.value = props.options.findIndex(
    (opt) => opt.value === props.modelValue,
  )

  nextTick(() => {
    scrollToHighlighted()
  })
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1
}

function selectOption(option: SelectOption) {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
  triggerRef.value?.focus()
}

function scrollToHighlighted() {
  if (highlightedIndex.value >= 0 && optionRefs.value[highlightedIndex.value]) {
    optionRefs.value[highlightedIndex.value]?.scrollIntoView({
      block: 'nearest',
    })
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        const option = props.options[highlightedIndex.value]
        if (option && !option.disabled) {
          selectOption(option)
        }
      } else {
        openDropdown()
      }
      break

    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break

    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        const nextIndex = findNextEnabledIndex(highlightedIndex.value, 1)
        if (nextIndex !== -1) {
          highlightedIndex.value = nextIndex
          scrollToHighlighted()
        }
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        const prevIndex = findNextEnabledIndex(highlightedIndex.value, -1)
        if (prevIndex !== -1) {
          highlightedIndex.value = prevIndex
          scrollToHighlighted()
        }
      }
      break

    case 'Home':
      event.preventDefault()
      if (isOpen.value) {
        const firstIndex = findNextEnabledIndex(-1, 1)
        if (firstIndex !== -1) {
          highlightedIndex.value = firstIndex
          scrollToHighlighted()
        }
      }
      break

    case 'End':
      event.preventDefault()
      if (isOpen.value) {
        const lastIndex = findNextEnabledIndex(props.options.length, -1)
        if (lastIndex !== -1) {
          highlightedIndex.value = lastIndex
          scrollToHighlighted()
        }
      }
      break

    case 'Tab':
      if (isOpen.value) {
        closeDropdown()
      }
      break
  }
}

function findNextEnabledIndex(currentIndex: number, direction: 1 | -1): number {
  let index = currentIndex + direction

  while (index >= 0 && index < props.options.length) {
    const option = props.options[index]
    if (option && !option.disabled) {
      return index
    }
    index += direction
  }

  return -1
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    closeDropdown()
  }
}

function getOptionClasses(option: SelectOption, index: number) {
  const base = [
    'cursor-pointer',
    'transition-colors',
    'duration-150',
    sizeClasses.value.option,
  ]

  if (option.disabled) {
    base.push('text-secondary-400', 'cursor-not-allowed', 'bg-secondary-50')
  } else if (option.value === props.modelValue) {
    base.push('bg-primary-50', 'text-primary-700', 'font-medium')
  } else if (index === highlightedIndex.value) {
    base.push('bg-secondary-100', 'text-secondary-900')
  } else {
    base.push('text-secondary-700', 'hover:bg-secondary-50')
  }

  return base.join(' ')
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('scroll', calculatePosition, true)
    window.addEventListener('resize', calculatePosition)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('scroll', calculatePosition, true)
    window.removeEventListener('resize', calculatePosition)
  }
})

onMounted(() => {
  if (isOpen.value) {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('scroll', calculatePosition, true)
  window.removeEventListener('resize', calculatePosition)
})
</script>

<template>
  <div :class="['kc-select', { 'w-full': fullWidth }]">
    <!-- 라벨 -->
    <label v-if="label" :id="`${selectId}-label`" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>

    <!-- Select wrapper -->
    <div class="relative">
      <!-- Trigger button -->
      <button
        :id="selectId"
        ref="triggerRef"
        type="button"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
        :aria-labelledby="label ? `${selectId}-label` : undefined"
        :aria-controls="`${selectId}-listbox`"
        :aria-activedescendant="
          highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined
        "
        :disabled="disabled"
        :class="triggerClasses"
        @click="toggleDropdown"
        @keydown="handleKeydown"
      >
        <span :class="{ 'text-secondary-400': !selectedOption && placeholder }">
          {{ displayText }}
        </span>
      </button>

      <!-- Dropdown arrow icon -->
      <div :class="iconWrapperClasses">
        <svg
          :class="iconClasses"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Dropdown menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <ul
          v-show="isOpen"
          :id="`${selectId}-listbox`"
          ref="dropdownRef"
          role="listbox"
          :aria-labelledby="label ? `${selectId}-label` : undefined"
          :class="dropdownClasses"
          :style="{
            transformOrigin: dropdownPosition === 'top' ? 'bottom' : 'top',
          }"
        >
          <li
            v-for="(option, index) in options"
            :id="`${selectId}-option-${index}`"
            :key="option.value"
            :ref="(el) => (optionRefs[index] = el as HTMLElement)"
            role="option"
            :aria-selected="option.value === modelValue"
            :aria-disabled="option.disabled"
            :class="getOptionClasses(option, index)"
            @click="selectOption(option)"
            @mouseenter="!option.disabled && (highlightedIndex = index)"
          >
            {{ option.label }}
          </li>
        </ul>
      </Transition>
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
