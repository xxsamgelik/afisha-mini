<script setup>
defineProps({
  height: { type: String, default: '120px' },
  radius: { type: String, default: 'var(--r-card)' },
})
</script>

<template>
  <div class="skeleton skeleton-block" :style="{ height, borderRadius: radius }" />
</template>

<style scoped>
.skeleton-block {
  width: 100%;
}
</style>
