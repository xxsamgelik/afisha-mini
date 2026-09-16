<script setup>
// Страница события: hero + описание + вкладки дней (calendar) + сеансы на день
// (/api/v2/schedule/events/{id}) + «Похожие».
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EventCard from '@/components/EventCard.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import StateMessage from '@/components/StateMessage.vue'
import VenueSessions from '@/components/VenueSessions.vue'
import { isAbort } from '@/lib/api'
import { dayStartUnix, dateHumanWithWeekday, isValidIso, todayIso, weekdayShort, dayNumber } from '@/lib/date'
import { durationHuman, priceLabel } from '@/lib/format'
import { hero } from '@/lib/img'
import { getEvent, getSchedule } from '@/lib/endpoints'
import { openSession, store } from '@/store'

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))

const status = ref('loading') // loading | ready | error
const page = ref(null) // {performance, objects, calendar, more}

const scheduleStatus = ref('idle') // idle | loading | ready | empty
const venues = ref([])
let scheduleCtrl = null

const performance = computed(() => page.value?.performance)
const calendar = computed(() => (page.value?.calendar || []).filter((day) => day.date))

const selectedDate = computed(() => {
  const queryDate = route.query.date
  if (isValidIso(queryDate)) return queryDate
  const iso = todayIso()
  return calendar.value.some((day) => day.date === iso) ? iso : calendar.value[0]?.date || iso
})

watch(
  slug,
  () => {
    load()
  },
  { immediate: true },
)

watch(selectedDate, (date) => {
  if (status.value === 'ready') loadSchedule(date)
})

async function load() {
  status.value = 'loading'
  page.value = null
  venues.value = []
  try {
    page.value = await getEvent(slug.value)
    if (!page.value.performance) {
      status.value = 'error'
      return
    }
    store.headerTitle = page.value.performance.name
    status.value = 'ready'
    loadSchedule(selectedDate.value)
  } catch {
    status.value = 'error'
  }
}

async function loadSchedule(date) {
  if (!performance.value?.id || !date) return
  scheduleCtrl?.abort()
  scheduleCtrl = new AbortController()
  scheduleStatus.value = 'loading'
  try {
    const data = await getSchedule(performance.value.id, dayStartUnix(date), scheduleCtrl.signal)
    venues.value = data?.objects || []
    scheduleStatus.value = venues.value.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err)) scheduleStatus.value = 'error'
  }
}

function pickDate(iso) {
  // replace: вкладки дней — фильтр, историю не раздуваем
  router.replace({ query: { ...route.query, date: iso } })
}

function onBuy(session) {
  openSession(session, performance.value?.name)
}

const heroImg = computed(() => hero(performance.value?.image, performance.value?.images))
const price = computed(() => priceLabel(performance.value?.minPrice))
const age = computed(() => {
  const n = Number(performance.value?.minAge)
  return n > 0 ? `${n}+` : ''
})
const meta = computed(() => {
  const p = performance.value || {}
  return [durationHuman(p.duration), p.addation?.country, p.addation?.issueYear].filter(Boolean)
})
const genres = computed(() => (performance.value?.genres || []).map((g) => g.name).slice(0, 3))
const description = computed(
  () => performance.value?.description || performance.value?.shortDescription || '',
)
</script>

<template>
  <div>
    <template v-if="status === 'loading'">
      <div class="event-loading">
        <SkeletonBlock height="210px" :radius="'0'" />
        <SkeletonBlock height="20px" />
        <SkeletonBlock height="120px" />
      </div>
    </template>

    <StateMessage
      v-else-if="status === 'error'"
      icon="refresh"
      title="Не получилось загрузить"
      text="Проверьте соединение и попробуйте ещё раз"
      retryable
      @retry="load"
    />

    <template v-else>
      <!-- hero -->
      <div class="hero">
        <img v-if="heroImg" class="hero__img" :src="heroImg" :alt="performance.name" decoding="async">
        <div class="hero__overlay" />
        <div class="hero__data">
          <div v-if="genres.length || age" class="hero__tags">
            <span v-for="genre in genres" :key="genre" class="hero__tag">{{ genre }}</span>
            <span v-if="age" class="hero__age">{{ age }}</span>
          </div>
          <h1 class="hero__name">{{ performance.name }}</h1>
          <p v-if="price || meta.length" class="hero__meta">
            <span v-if="price">{{ price }}</span>
            <span v-for="item in meta" :key="item">{{ item }}</span>
          </p>
        </div>
      </div>

      <!-- описание -->
      <section v-if="description" class="section">
        <h2 class="section__title">Описание</h2>
        <!-- HTML приходит из админки 24afisha, как и на самом сайте -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="section__text" v-html="description" />
      </section>

      <!-- дни из calendar + сеансы -->
      <section class="section">
        <h2 class="section__title">Расписание</h2>
        <div class="days scroll-row">
          <button
            v-for="day in calendar"
            :key="day.date"
            class="days__slot"
            :class="{ 'is-active': day.date === selectedDate, 'is-disabled': !day.count }"
            type="button"
            :disabled="!day.count"
            @click="pickDate(day.date)"
          >
            <span class="days__weekday">{{ weekdayShort(day.date) }}</span>
            <span class="days__num">{{ dayNumber(day.date) }}</span>
          </button>
        </div>

        <p v-if="selectedDate" class="days__label">{{ dateHumanWithWeekday(selectedDate) }}</p>

        <template v-if="scheduleStatus === 'loading'">
          <div class="event-loading">
            <SkeletonBlock height="72px" />
            <SkeletonBlock height="72px" />
          </div>
        </template>
        <StateMessage
          v-else-if="scheduleStatus === 'error'"
          icon="refresh"
          title="Сеансы не загрузились"
          retryable
          @retry="loadSchedule(selectedDate)"
        />
        <StateMessage
          v-else-if="scheduleStatus === 'empty'"
          icon="clock"
          title="На эту дату сеансов нет"
          text="Выберите другой день в расписании выше"
        />
        <div v-else>
          <VenueSessions
            v-for="venue in venues"
            :key="venue.id"
            :venue="venue"
            @buy="onBuy"
          />
        </div>
      </section>

      <!-- похожие -->
      <section v-if="page.more.length" class="section">
        <h2 class="section__title">Похожие события</h2>
        <div class="more scroll-row">
          <EventCard
            v-for="event in page.more"
            :key="event.id"
            class="more__card"
            :event="event"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.event-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* hero */
.hero {
  position: relative;
  min-height: 220px;
}

.hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(21, 12, 41, 0.05) 30%, rgba(21, 12, 41, 0.82) 100%);
}

.hero__data {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 110px 16px 16px;
  color: #fff;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.hero__tag {
  padding: 3px 10px;
  border-radius: var(--r-chip);
  background: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.hero__age {
  padding: 3px 8px;
  border-radius: var(--r-chip);
  background: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  font-weight: 700;
}

.hero__name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  opacity: 0.92;
}

/* секции */
.section {
  padding: 20px 16px 0;
}

.section__title {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
}

.section__text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text);
  overflow-wrap: break-word;
}

.section__text :deep(p) {
  margin: 0 0 10px;
}

.section__text :deep(img) {
  border-radius: var(--r-card);
}

/* вкладки дней */
.days {
  gap: 6px;
  padding-bottom: 4px;
}

.days__slot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 52px;
  height: 48px;
  border: 1px solid var(--border-light);
  border-radius: var(--r-date);
}

.days__weekday {
  font-size: 11px;
  color: var(--text-muted-2);
}

.days__num {
  font-size: 15px;
  font-weight: 600;
}

.days__slot.is-active {
  border: 2px solid var(--brand);
}

.days__slot.is-active .days__weekday,
.days__slot.is-active .days__num {
  color: var(--brand);
}

.days__slot.is-disabled {
  opacity: 0.35;
  pointer-events: none;
}

.days__label {
  margin: 14px 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

/* похожие */
.more {
  gap: 12px;
  padding-bottom: 8px;
}

.more__card {
  width: 140px;
  flex-shrink: 0;
}
</style>
