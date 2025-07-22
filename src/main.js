import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css'
import './style.css'
import { useStorage } from '@vueuse/core'
import { cargoDefaultData, truckDefaultData } from './utils/default'

const app = createApp(App)

app.use(ArcoVue)
app.use(ArcoVueIcon)
app.mount('#app')

useStorage('cargo-crating-database', {
  cargo: cargoDefaultData,
  truck: truckDefaultData,
})
