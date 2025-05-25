<script lang="ts" setup>
definePageMeta({
  colorMode: 'light',
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <header class="text-center mb-12">
        <h1 class="text-[clamp(2rem,5vw,3rem)] font-bold text-neutral mb-4">
          货物装箱计算器
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          快速计算不同货车型号可装载的标准箱数量，支持多种规格混合装箱
        </p>
      </header>

      <!-- <div class="mt-12 bg-white rounded-xl p-6 card-shadow">
        <h2 class="text-xl font-semibold text-neutral mb-6 flex items-center">
          <i class="fa fa-table text-primary mr-2"></i> 货车与箱规数据
        </h2>

        <div class="overflow-x-auto">
          <UTable :data="truckData" class="flex-1" />
        </div>

        <div class="mt-8 overflow-x-auto">
          <UTable :data="boxData" class="flex-1" />
        </div>
      </div> -->

      <SpecTable
        prop="truck"
        name="货车"
        :default="defaultTruckSpecs"
      ></SpecTable>

      <footer class="mt-12 text-center text-gray-500 text-sm">
        <p>货车装箱计算器 &copy; 2025 | 物流优化工具</p>
      </footer>
    </div>
  </div>
</template>
