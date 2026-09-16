import { createRouter, createWebHashHistory } from 'vue-router'

import CategoryView from '@/views/CategoryView.vue'
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
    { path: '/', name: 'home', component: HomeView },
    { path: '/c/:slug', name: 'category', component: CategoryView },
    { path: '/event/:slug', name: 'event', component: EventView, meta: { back: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { back: true, title: 'Поиск' } },
    { path: '/city', name: 'city', component: CityView, meta: { back: true, title: 'Город' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: NotFoundView,
      meta: { back: true, title: 'Не найдено' },
      // Telegram Desktop кладёт tgWebAppData в hash (url#tgWebAppData=…), и
      // hash-роутер принимает это за путь → редиректим на главную
      beforeEnter: (to) => {
        if (to.path.includes('tgWebAppData=')) return { path: '/' }
      },
    },
  ],
})
