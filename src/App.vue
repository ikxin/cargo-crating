<script setup>
import { useStorage } from '@vueuse/core'
import SpecTable from './components/SpecTable.vue'

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})
</script>

<template>
  <div class="flex gap-4 p-4">
    <SpecTable class="w-3/7" prop="truck" name="货车" />
    <SpecTable class="w-4/7" prop="cargo" name="货物" />
  </div>
</template>
