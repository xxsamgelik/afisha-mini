<script setup>
// Карточка события: постер 240×340 + цена-чип + название + тип.
import { computed } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { priceLabel } from '@/lib/format'
import { poster } from '@/lib/img'

const props = defineProps({
  event: { type: Object, required: true },
})

const image = computed(() => poster(props.event.image))
const price = computed(() => priceLabel(props.event.minPrice))
const kind = computed(() => props.event.types?.[0]?.name || props.event.genres?.[0]?.name || '')
</script>

<template>
  <router-link class="event-card" :to="`/event/${event.slug}`">
    <div class="event-card__view">
      <img
        v-if="image"
        class="event-card__img"
        :src="image"
        :alt="event.name"
        loading="lazy"
        decoding="async"
      >
      <span v-if="price" class="event-card__price">{{ price }}</span>
    </div>
    <p class="event-card__name">{{ event.name }}</p>
    <p v-if="kind" class="event-card__meta">
      <AppIcon name="clock" :size="12" />
      {{ kind }}
    </p>
  </router-link>
</template>

<style scoped>
.event-card {
  display: block;
  min-width: 0;
}

.event-card__view {
  position: relative;
  aspect-ratio: 240 / 340;
  overflow: hidden;
  border-radius: var(--r-card);
  background: var(--surface-3);
}

.event-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-card__price {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 3px 8px;
  border-radius: var(--r-chip);
  background: var(--chip-price-bg);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.event-card__name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
}

.event-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
