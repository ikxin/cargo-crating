<script setup>
import CargoMode from './views/CargoMode.vue'
import TruckMode from './views/TruckMode.vue'
import SpecTable from './components/SpecTable.vue'
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <ATabs default-active-key="2" type="capsule" size="large">
      <ATabPane key="1" title="货车模式">
        <TruckMode />
      </ATabPane>
      <ATabPane key="2" title="货物模式">
        <CargoMode />
      </ATabPane>
    </ATabs>
    <div class="flex gap-4">
      <SpecTable class="w-3/7" prop="truck" name="货车" />
      <SpecTable class="w-4/7" prop="cargo" name="货物" />
    </div>
  </div>
</template>
