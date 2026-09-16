import { createRouter, createWebHashHistory } from 'vue-router'

import EventView from '@/views/EventView.vue'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import SearchView from '@/views/SearchView.vue'
import CityView from '@/views/CityView.vue'

// hash-режим: не зависит от пути/домена, где «Оплати» разместит webview;
// deep-link не 404-ит. Переход на createWebHistory — одна строка + try_files уже в nginx.conf.
export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/c/top' },
    { path: '/c/:slug', name: 'category', component: HomeView },
    { path: '/event/:slug', name: 'event', component: EventView, meta: { back: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { back: true, title: 'Поиск' } },
    { path: '/city', name: 'city', component: CityView, meta: { back: true, title: 'Город' } },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView, meta: { back: true, title: 'Не найдено' } },
  ],
})
