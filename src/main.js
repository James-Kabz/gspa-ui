import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '../src/styles/base.css'
import { initTheme } from './lib/theme'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { tooltip } from './directives/tooltip'


const app = createApp(App)

initTheme()

library.add(
    fas,
    far,
    fab,

)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.directive('tooltip', tooltip)
app.use(createPinia())
app.use(router)

app.mount('#app')
