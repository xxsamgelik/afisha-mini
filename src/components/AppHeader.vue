<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { store } from '@/store'

const route = useRoute()

const isBack = computed(() => Boolean(route.meta.back))
const title = computed(() => store.headerTitle || route.meta.title || '')
</script>

<template>
  <header class="hdr">
    <div class="hdr__sheen" aria-hidden="true" />
    <template v-if="!isBack">
      <router-link class="hdr__logo" to="/c/top">24<span> афиша</span></router-link>
      <router-link class="hdr__city" to="/city">
        <AppIcon name="pin" :size="16" />
        <span>{{ store.city.name }}</span>
      </router-link>
      <router-link class="hdr__icon" to="/search" aria-label="Поиск">
        <AppIcon name="search" :size="20" />
      </router-link>
    </template>
    <template v-else>
      <button class="hdr__icon" type="button" aria-label="Назад" @click="$router.back()">
        <AppIcon name="arrow-left" :size="22" />
      </button>
      <div class="hdr__title">{{ title }}</div>
      <router-link v-if="route.name === 'event'" class="hdr__icon" to="/search" aria-label="Поиск">
        <AppIcon name="search" :size="20" />
      </router-link>
    </template>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  height: calc(var(--header-h) + var(--safe-top));
  padding: var(--safe-top) 16px 0;
  background: var(--grad);
  color: var(--on-brand);
}

/* фирменный блик поверх градиента */
.hdr__sheen {
  position: absolute;
  inset: 0;
  background: var(--grad-sheen);
  mix-blend-mode: screen;
  opacity: 0.58;
  pointer-events: none;
}

.hdr > * {
  position: relative;
}

.hdr__logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.hdr__logo span {
  font-weight: 400;
}

.hdr__city {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--r-input);
  background: rgba(255, 255, 255, 0.2);
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.hdr__city span {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hdr__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.hdr__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--r-input);
  color: var(--on-brand);
}
</style>
