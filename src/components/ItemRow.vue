<script setup>
// Строка товара/билета (performance.items) или услуги (objectsWithActiveServices).
// Цены: у товаров — строки-рубли; у услуг — как у сеансов, копейки.
import { computed } from 'vue'

import { kopecksLabel, priceLabel } from '@/lib/format'
import { poster } from '@/lib/img'

const props = defineProps({
  item: { type: Object, required: true },
  kind: { type: String, default: 'item' }, // item | service
})

const emit = defineEmits(['buy'])

const image = computed(() => poster(props.item.image))

const price = computed(() =>
  props.kind === 'service'
    ? kopecksLabel(props.item.minPrice) || priceLabel(props.item.minPrice)
    : priceLabel(props.item.minPrice),
)

// товар недоступен к онлайн-покупке — кнопка гасится
const disabled = computed(() => props.kind === 'item' && !props.item.isSaleOnline)
</script>

<template>
  <div class="item-row">
    <img v-if="image" class="item-row__img" :src="image" :alt="item.name" loading="lazy" decoding="async">
    <div class="item-row__main">
      <p class="item-row__name">{{ item.name }}</p>
      <p v-if="price" class="item-row__price">{{ price }}</p>
    </div>
    <button class="item-row__buy" type="button" :disabled="disabled" @click="emit('buy', item)">
      Купить
    </button>
  </div>
</template>

<style scoped>
.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.item-row:last-child {
  border-bottom: none;
}

.item-row__img {
  width: 48px;
  height: 64px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--r-date);
  background: var(--surface-3);
}

.item-row__main {
  flex: 1;
  min-width: 0;
}

.item-row__name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.item-row__price {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand);
}

.item-row__buy {
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: var(--r-pill);
  background: var(--btn);
  color: var(--on-brand);
  font-size: 13px;
  font-weight: 600;
}

.item-row__buy:active {
  background: var(--btn-hover);
}

.item-row__buy:disabled {
  background: #ececf1;
  color: #9a9aa5;
}
</style>
