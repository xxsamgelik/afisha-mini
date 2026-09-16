<script setup>
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  icon: { type: String, default: 'calendar' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  retryable: { type: Boolean, default: false },
})

defineEmits(['retry'])
</script>

<template>
  <div class="state">
    <span class="state__icon"><AppIcon :name="icon" :size="28" /></span>
    <p class="state__title">{{ title }}</p>
    <p v-if="text" class="state__text">{{ text }}</p>
    <button v-if="retryable" class="state__retry" type="button" @click="$emit('retry')">
      <AppIcon name="refresh" :size="16" />
      Повторить
    </button>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
}

.state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-3);
  color: var(--text-muted-2);
}

.state__title {
  font-size: 15px;
  font-weight: 600;
}

.state__text {
  font-size: 13px;
  color: var(--text-muted);
}

.state__retry {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 9px 18px;
  border-radius: var(--r-pill);
  background: var(--btn);
  color: var(--on-brand);
  font-size: 13px;
  font-weight: 600;
}
</style>
