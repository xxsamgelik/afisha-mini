import { createApp } from 'vue'

import App from './App.vue'
import { initTelegram } from './lib/telegram'
import { router } from './router'
import { init } from './store'
import './styles/base.css'
import './styles/tokens.css'

// данные грузим параллельно с монтированием — UI рисуется сразу
init()
initTelegram(router)

createApp(App).use(router).mount('#app')
