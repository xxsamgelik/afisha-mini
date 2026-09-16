<template>
  <div class="sk-card">
    <div class="skeleton sk-card__poster" />
    <div class="skeleton sk-card__line sk-card__line--w80" />
    <div class="skeleton sk-card__line sk-card__line--w50" />
  </div>
</template>

<style scoped>
.sk-card__poster {
  aspect-ratio: 240 / 340;
  border-radius: var(--r-card);
}

.sk-card__line {
  height: 12px;
  margin-top: 8px;
  border-radius: 4px;
}

.sk-card__line--w80 {
  width: 80%;
}

.sk-card__line--w50 {
  width: 50%;
}
</style>
