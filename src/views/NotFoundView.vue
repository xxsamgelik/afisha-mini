<script setup>
import StateMessage from '@/components/StateMessage.vue'
</script>

<template>
  <StateMessage
    icon="search"
    title="Страница не найдена"
    text="Похоже, такой страницы нет"
  />
  <div class="nf">
    <router-link class="nf__btn" to="/c/top">На главную</router-link>
  </div>
</template>

<style scoped>
.nf {
  display: flex;
  justify-content: center;
  margin-top: -24px;
}

.nf__btn {
  padding: 10px 22px;
  border-radius: var(--r-pill);
  background: var(--btn);
  color: var(--on-brand);
  font-size: 14px;
  font-weight: 600;
}
</style>
