<script setup>
import { useStorage } from '@vueuse/core'

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargoCategory: [],
  cargo: [],
})

console.log(crypto.randomUUID())
</script>

<template>
  <div></div>
</template>
