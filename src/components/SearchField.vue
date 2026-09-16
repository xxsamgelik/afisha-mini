<script setup>
// Инпут поиска с debounce 300 мс (v-model по update:modelValue).
import { onBeforeUnmount, ref } from 'vue'

import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  delay: { type: Number, default: 300 },
})

const emit = defineEmits(['update:modelValue'])

const input = ref(null)
let timer = null

function onInput(event) {
  const value = event.target.value
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', value), props.delay)
}

function clear() {
  clearTimeout(timer)
  emit('update:modelValue', '')
  input.value?.focus()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="search-field">
    <AppIcon class="search-field__icon" name="search" :size="18" />
    <input
      ref="input"
      class="search-field__input"
      type="search"
      :value="modelValue"
      placeholder="Событие, актёр, место…"
      enterkeyhint="search"
      autofocus
      @input="onInput"
      @keydown.esc="clear"
    >
    <button v-if="modelValue" class="search-field__clear" type="button" aria-label="Очистить" @click="clear">
      <AppIcon name="close" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.search-field__icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted-2);
  pointer-events: none;
}

.search-field__input {
  width: 100%;
  height: 48px;
  padding: 0 44px;
  border: none;
  border-radius: 16px;
  background: var(--surface-2);
  font-family: var(--font);
  font-size: 16px; /* 16px — чтобы iOS не зумил */
  color: var(--text);
  appearance: none;
  -webkit-appearance: none;
}

.search-field__input::placeholder {
  color: var(--text-muted-2);
}

.search-field__input:focus {
  outline: none;
  box-shadow: var(--sh-focus);
}

.search-field__input::-webkit-search-cancel-button {
  display: none;
}

.search-field__clear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-3);
  color: var(--text-muted);
}
</style>
