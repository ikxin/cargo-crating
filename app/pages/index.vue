<script lang="ts" setup>
import { nanoid } from 'nanoid'
import { useStorage } from '@vueuse/core'

definePageMeta({
  colorMode: 'light',
})

const truckData = useStorage<SpecsType[]>('truck-data', [])

const cargoData = useStorage<SpecsType[]>('cargo-data', [])

const selectedTruck = ref()

const currentTruck = computed(() => {
  return truckData.value.find((item) => item.uuid === selectedTruck.value)
})

const remainingLength = computed(() => {
  let totalCargoLength = 0
  currentCargo.value.forEach((item) => {
    totalCargoLength += item?.fixedBoxLength || 0
  })
  if (currentTruck.value) {
    return currentTruck.value.length - totalCargoLength
  } else {
    return 0
  }
})

type CargoType = {
  uuid?: string
  cargoUuid?: string
  name?: string
  length?: number
  width?: number
  height?: number
  place?: number
  remainingLength?: number
  remainingWidth?: number
  remainingHeight?: number
  rowCount?: number
  columnCount?: number
  longCount?: number
  rowLength?: number
  fixedBoxCount?: number
  fixedBoxLength?: number
}

const currentCargo = ref<CargoType[]>([
  {
    uuid: nanoid(),
  },
])

const placeItem = [
  {
    label: '横向',
    value: 1,
  },
  {
    label: '顺向',
    value: 2,
  },
]

const cargoChange = (index: number) => {
  const cargo = cargoData.value.find(
    (item) => item.uuid === currentCargo.value[index]?.cargoUuid
  )
  currentCargo.value[index] = {
    ...cargo,
    uuid: currentCargo.value[index]?.uuid,
  }
}

const placeChange = (index: number) => {
  const cargo = currentCargo.value[index]!
  const truck = currentTruck.value!

  if (!cargo || !truck) {
    return
  }

  if (cargo.place === 1) {
    cargo.rowCount = Math.floor(truck.width / (cargo.length || 1))
    cargo.columnCount = Math.floor(truck.height / (cargo.height || 1))
    cargo.longCount = Math.floor(truck.length / (cargo.width || 1))
    cargo.rowLength = cargo.width || 0
    cargo.remainingLength = truck.length - cargo.rowLength * cargo.longCount
    cargo.remainingWidth = truck.width - cargo.length! * cargo.rowCount
    cargo.remainingHeight = truck.height - cargo.height! * cargo.columnCount
  }

  if (cargo.place === 2) {
    cargo.rowCount = Math.floor(truck.width / (cargo.width || 1))
    cargo.columnCount = Math.floor(truck.height / (cargo.height || 1))
    cargo.longCount = Math.floor(truck.length / (cargo.length || 1))
    cargo.rowLength = cargo.length || 0
    cargo.remainingLength = truck.length - cargo.rowLength * cargo.longCount
    cargo.remainingWidth = truck.width - cargo.width! * cargo.rowCount
    cargo.remainingHeight = truck.height - cargo.height! * cargo.columnCount
  }

  currentCargo.value[index] = {
    ...cargo,
    fixedBoxCount: Math.floor(cargo.remainingLength! / (cargo.rowLength || 1)),
    fixedBoxLength: (cargo.rowLength || 0) * (cargo.fixedBoxCount || 0),
  }
}

const fixedBoxCountChange = (index: number) => {
  const cargo = currentCargo.value[index]!
  cargo.fixedBoxLength = cargo.rowLength! * cargo.fixedBoxCount!
  currentCargo.value[index] = { ...cargo }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-5xl flex flex-col gap-8">
      <header class="text-center mb-12">
        <h1 class="text-[clamp(2rem,5vw,3rem)] font-bold text-neutral mb-4">
          货物装箱计算器
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          快速计算不同货车型号可装载的标准箱数量，支持多种规格混合装箱
        </p>
      </header>

      <UCard>
        <template #header>
          <div class="flex gap-2">
            <UIcon name="lucide:calculator" class="text-2xl text-primary" />
            <span class="text-xl font-semibold">参数设置</span>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField label="货车型号" required>
            <div class="flex gap-2 align-center">
              <USelect
                v-model="selectedTruck"
                value-key="uuid"
                label-key="name"
                :items="truckData"
                class="w-48"
                placeholder="选择货车型号"
              />
              <UInput :model-value="currentTruck?.length" class="w-16" />
              <UInput :model-value="currentTruck?.width" class="w-16" />
              <UInput :model-value="currentTruck?.height" class="w-16" />
              <UBadge
                :label="`剩余长度：${remainingLength}`"
                :color="remainingLength >= 0 ? 'primary' : 'error'"
              />
            </div>
          </UFormField>
          <UButton
            class="w-fit"
            @click="
              currentCargo.push({
                uuid: nanoid(),
              })
            "
          >
            添加货物
          </UButton>
          <div class="flex flex-col gap-4 text-base">
            <template v-for="(item, index) in currentCargo" :key="index">
              <div class="flex gap-2">
                <USelect
                  v-model="currentCargo[index]!.cargoUuid"
                  value-key="uuid"
                  label-key="name"
                  :items="cargoData"
                  class="w-28"
                  placeholder="货物规格"
                  @change="cargoChange(index)"
                />
                <USelectMenu
                  v-model="currentCargo[index]!.place"
                  :items="placeItem"
                  value-key="value"
                  placeholder="摆放方式"
                  class="w-28"
                  @change="placeChange(index)"
                />
                <UBadge :label="`每排长度：${item.rowLength || 0}`" />
                <UBadge>
                  每排箱数：{{
                    (item.rowCount || 0) + ' x ' + (item.columnCount || 0)
                  }}
                </UBadge>
                <UBadge :label="`最大排数：${item.longCount || 0}`" />
                <UBadge>
                  剩余：{{
                    (item.remainingLength || 0) +
                    ' x ' +
                    (item.remainingWidth || 0) +
                    ' x ' +
                    (item.remainingHeight || 0)
                  }}
                </UBadge>
                <UInputNumber
                  v-model="item.fixedBoxCount"
                  class="w-28"
                  @change="fixedBoxCountChange(index)"
                />
                <UBadge :label="`当前长度：${item.fixedBoxLength || 0}`" />
              </div>
            </template>
          </div>
        </div>
      </UCard>

      <SpecTable
        prop="truck"
        name="货车"
        :default="defaultTruckSpecs"
      ></SpecTable>

      <SpecTable
        prop="cargo"
        name="货物"
        :default="defaultCargoSpecs"
      ></SpecTable>

      <footer class="mt-12 text-center text-gray-500 text-sm">
        <p>货车装箱计算器 &copy; 2025 | 物流优化工具</p>
      </footer>
    </div>
  </div>
</template>
