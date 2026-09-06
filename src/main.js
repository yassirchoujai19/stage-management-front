import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia()) // state management - must come before the router (guards use a store)
app.use(router)

app.mount('#app')
