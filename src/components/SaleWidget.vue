<script setup>
// Полноэкранный iframe продажи (saleframe). Порт postMessage-протокола
// common/components/widget/widget.vue:94-112:
//   closeFrame → закрыть; closeFrameError → тост + закрыть;
//   requestToken → ответить {action:'auth', token:''} на origin виджета (в мини-аппе логина нет).
// Fallback для webview: «Открыть в браузере» через oplati.openExternal.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { openExternal } from '@/lib/oplati'
import { closeWidget, showToast, store } from '@/store'

const iframe = ref(null)

const origin = computed(() => {
  try {
    return new URL(store.widget.url).origin
  } catch {
    return ''
  }
})

function onMessage(event) {
  const action = event.data?.action
  if (!action) return
  if (action === 'closeFrame') {
    closeWidget()
  } else if (action === 'closeFrameError') {
    showToast('Ошибка оплаты. Попробуйте ещё раз')
    closeWidget()
  } else if (action === 'requestToken') {
    iframe.value?.contentWindow?.postMessage({ action: 'auth', token: '' }, origin.value)
  }
}

function close() {
  closeWidget()
}

function openOutside() {
  openExternal(store.widget.url)
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <div v-if="store.widget.open" class="widget">
    <div class="widget__bar">
      <p class="widget__title">{{ store.widget.title || 'Покупка билета' }}</p>
      <button class="widget__close" type="button" aria-label="Закрыть" @click="close">
        <AppIcon name="close" :size="18" />
      </button>
    </div>
    <iframe
      id="widget"
      ref="iframe"
      class="widget__frame"
      :src="store.widget.url"
      allow="payment; clipboard-write"
      referrerpolicy="no-referrer-when-downgrade"
    />
    <p class="widget__fallback">
      Не открывается?
      <a :href="store.widget.url" target="_blank" rel="noopener" @click.prevent="openOutside">
        Открыть в браузере
      </a>
    </p>
  </div>
</template>

<style scoped>
.widget {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: var(--surface);
}

/* на десктопе — той же ширины, что shell приложения */
@media (min-width: 481px) {
  .widget {
    left: 50%;
    transform: translateX(-50%);
    width: var(--shell-w);
  }
}

.widget__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: calc(8px + var(--safe-top)) 12px 8px;
  background: var(--grad);
  color: var(--on-brand);
}

.widget__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.widget__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: var(--on-brand);
}

.widget__frame {
  flex: 1;
  width: 100%;
  border: 0;
}

.widget__fallback {
  padding: 8px 16px calc(8px + var(--safe-bottom));
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.widget__fallback a {
  color: var(--brand);
  font-weight: 600;
}
</style>
