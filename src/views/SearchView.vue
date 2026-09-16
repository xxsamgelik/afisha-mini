<script setup>
// Поиск событий: /api/v2/search (target=site), debounce 300 мс.
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import SearchField from '@/components/SearchField.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import StateMessage from '@/components/StateMessage.vue'
import { isAbort } from '@/lib/api'
import { search } from '@/lib/endpoints'

const router = useRouter()

const query = ref('')
const status = ref('idle') // idle | loading | ready | empty | error
const performances = ref([])
let ctrl = null

watch(query, (value) => {
  const q = value.trim()
  ctrl?.abort()
  if (q.length < 2) {
    status.value = 'idle'
    performances.value = []
    return
  }
  load(q)
})

async function load(q) {
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    const data = await search(q, ctrl.signal)
    // ответ мог устареть, пока летел запрос
    if (query.value.trim() !== q) return
    performances.value = data.performances
    status.value = data.performances.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err) && query.value.trim() === q) status.value = 'error'
  }
}

function open(performance) {
  router.push(`/event/${performance.slug}`)
}
</script>

<template>
  <div class="search">
    <div class="search__box">
      <SearchField v-model="query" />
    </div>

    <StateMessage
      v-if="status === 'error'"
      icon="refresh"
      title="Не получилось загрузить"
      retryable
      @retry="load(query.trim())"
    />
    <template v-else-if="status === 'loading'">
      <div class="search__list">
        <SkeletonBlock v-for="i in 4" :key="i" height="48px" />
      </div>
    </template>
    <StateMessage
      v-else-if="status === 'empty'"
      icon="search"
      title="Ничего не нашлось"
      :text="`По запросу «${query.trim()}» событий нет`"
    />
    <StateMessage
      v-else-if="status === 'idle'"
      icon="search"
      title="Что ищем?"
      text="Введите минимум две буквы — покажем события"
    />

    <div v-else class="search__list">
      <button
        v-for="item in performances"
        :key="item.slug"
        class="search__row"
        type="button"
        @click="open(item)"
      >
        <span class="search__row-main">
          <span class="search__name">{{ item.name }}</span>
          <span v-if="item.types?.[0]?.name" class="search__kind">{{ item.types[0].name }}</span>
        </span>
        <AppIcon name="chevron-right" :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search__box {
  padding: 12px 16px 4px;
}

.search__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
}

.search__row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--r-input);
  background: var(--surface-2);
  text-align: left;
}

.search__row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.search__kind {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
