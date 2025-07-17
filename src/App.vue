<script setup>
import CargoMode from './views/CargoMode.vue'
import TruckMode from './views/TruckMode.vue'
import SpecTable from './components/SpecTable.vue'
</script>

<template>
  <AScrollbar class="h-screen w-screen overflow-auto">
    <div class="flex flex-col gap-4 p-4">
      <ATabs default-active-key="1" type="capsule" size="large">
        <ATabPane key="1" title="货车模式">
          <TruckMode />
        </ATabPane>
        <ATabPane key="2" title="货物模式">
          <CargoMode />
        </ATabPane>
      </ATabs>
      <div class="grid grid-cols-7 gap-4">
        <SpecTable class="col-span-3" prop="truck" name="货车" />
        <SpecTable class="col-span-4" prop="cargo" name="货物" />
      </div>
    </div>
  </AScrollbar>
</template>
