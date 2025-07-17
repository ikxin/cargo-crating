<script setup>
import CargoMode from './views/CargoMode.vue'
import TruckMode from './views/TruckMode.vue'
import SpecTable from './components/SpecTable.vue'
import { ref } from 'vue'

const mode = ref('truck')

const tabs = {
  truck: TruckMode,
  cargo: CargoMode,
}
</script>

<template>
  <div class="sticky z-10 flex items-center justify-center p-4 shadow">
    <ARadioGroup v-model="mode" type="button" size="large">
      <ARadio value="truck">货车模式</ARadio>
      <ARadio value="cargo">货物模式</ARadio>
    </ARadioGroup>
  </div>

  <AScrollbar class="h-[calc(100vh-68px)] w-screen overflow-auto">
    <div class="flex flex-col gap-4 p-4">
      <KeepAlive>
        <component :is="tabs[mode]"></component>
      </KeepAlive>
      <div class="grid grid-cols-7 gap-4">
        <SpecTable class="col-span-3" prop="truck" name="货车" />
        <SpecTable class="col-span-4" prop="cargo" name="货物" />
      </div>
    </div>
  </AScrollbar>
</template>
