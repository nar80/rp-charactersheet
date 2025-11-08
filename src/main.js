import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dark, Dialog, Notify } from 'quasar'

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// Import WH40k Theme
import './assets/wh40k-theme.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {
    Dark,
    Dialog,
    Notify
  },
  config: {
    dark: true // Dark mode by default
  }
})

// Set dark mode
Dark.set(true)

app.mount('#app')
