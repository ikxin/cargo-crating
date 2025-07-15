import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css'
import './style.css'
import { useStorage } from '@vueuse/core'
import { cargoDefaultData, truckDefaultData } from './utils/default'

createApp(App).use(ArcoVue).mount('#app')

useStorage('cargo-crating-database', {
  cargo: cargoDefaultData,
  truck: truckDefaultData,
})
