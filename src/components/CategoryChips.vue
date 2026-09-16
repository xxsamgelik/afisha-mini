<script setup>
// Чипы категорий = /api/v3/mobile/afisha/category (store.categories).
// Самодостаточны: активный берётся из роута, клик — push (назад вернёт предыдущую категорию).
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { store } from '@/store'

const route = useRoute()
const router = useRouter()

const activeSlug = computed(() => String(route.params.slug || ''))

function pick(category) {
  if (category.slug === activeSlug.value) return
  router.push({ path: `/c/${category.slug}`, query: route.query })
}
</script>

<template>
  <nav class="chips scroll-row" aria-label="Категории">
    <button
      v-for="category in store.categories"
      :key="category.id"
      class="chips__item"
      :class="{ 'is-active': category.slug === activeSlug }"
      type="button"
      @click="pick(category)"
    >
      {{ category.name }}
    </button>
  </nav>
</template>

<style scoped>
.chips {
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface);
}

.chips__item {
  flex-shrink: 0;
  padding: 9px 16px;
  border-radius: var(--r-pill);
  background: var(--surface-3);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.chips__item.is-active {
  background: var(--btn);
  color: var(--on-brand);
}
</style>
