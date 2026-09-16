<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import SaleWidget from '@/components/SaleWidget.vue'
import { store } from '@/store'

const route = useRoute()

// динамический заголовок (название события) живёт только в пределах своего роута
watch(
  () => route.fullPath,
  () => {
    store.headerTitle = ''
  },
)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <router-view />
    </main>
    <SaleWidget />
    <transition name="fade">
      <div v-if="store.toast" class="toast">{{ store.toast }}</div>
    </transition>
  </div>
</template>
