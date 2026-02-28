import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

createApp(App)
    .use(createPinia())
    .use(router)
    .use(createVuetify())
    .mount('#app')
