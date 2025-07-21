<script setup>
import { useStorage } from '@vueuse/core'
import { cargoDefaultData, truckDefaultData } from '../utils/default'

const props = defineProps({
  prop: String,
  name: String,
})

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const resetDatabase = () => {
  database.value = {
    cargo: cargoDefaultData,
    truck: truckDefaultData,
  }
}
</script>

<template>
  <ACard title="系统设置">
    <AButton type="primary" status="warning" @click="resetDatabase">
      恢复出厂数据
    </AButton>
  </ACard>
</template>
