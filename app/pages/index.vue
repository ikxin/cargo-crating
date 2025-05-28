<script lang="ts" setup>
import { nanoid } from 'nanoid'
import { useStorage } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

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
  place?: 1 | 2 | 3 | 4 | 5 | 6
  remainingLength?: number
  remainingWidth?: number
  remainingHeight?: number
  rowCount?: number
  columnCount?: number
  longCount?: number
  rowLength?: number
  fixedBoxCount?: number
  fixedBoxLength?: number
  nw?: number
  gw?: number
}

const currentCargo = ref<CargoType[]>([
  {
    uuid: nanoid(),
  },
])

const placeItem = {
  1: '横向平放',
  2: '顺向平放',
  3: '横向靠放',
  4: '顺向靠放',
  5: '横向立放',
  6: '顺向立放',
}

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

const columns: TableColumn<CargoType>[] = [
  {
    header: '货物规格',
    accessorKey: 'name',
  },
  {
    header: '摆放方式',
    accessorKey: 'place',
    cell: ({ row }) => {
      const place = row.original.place!
      return placeItem[place] || '未知'
    },
  },
  {
    header: '横箱数',
    cell: ({ row }) => {
      return row.original.rowCount! || 0
    },
  },
  {
    header: '纵箱数',
    cell: ({ row }) => {
      return row.original.columnCount! || 0
    },
  },
  {
    header: '每排箱数',
    cell: ({ row }) => {
      return row.original.rowCount! * row.original.columnCount! || 0
    },
  },
  {
    header: '最大排数',
    cell: ({ row }) => {
      return row.original.longCount! || 0
    },
  },
  {
    header: '最大箱数',
    cell: ({ row }) => {
      const { longCount, rowCount, columnCount } = row.original!
      return longCount! * rowCount! * columnCount! || 0
    },
  },
  {
    header: '每排长度',
    cell: ({ row }) => {
      return row.original.rowLength || 0
    },
  },
  {
    header: '剩余长度',
    cell: ({ row }) => {
      return row.original.remainingLength || 0
    },
  },
  {
    header: '剩余宽度',
    cell: ({ row }) => {
      return row.original.remainingWidth || 0
    },
  },
  {
    header: '剩余高度',
    cell: ({ row }) => {
      return row.original.remainingHeight || 0
    },
  },
  {
    header: '每排净重',
    cell: ({ row }) => {
      const { nw, rowCount, columnCount } = row.original!
      return (nw || 0) * (rowCount || 0) * (columnCount || 0)
    },
  },
  {
    header: '每排毛重',
    cell: ({ row }) => {
      const { gw, rowCount, columnCount } = row.original!
      return (gw || 0) * (rowCount || 0) * (columnCount || 0)
    },
  },
  {
    header: '总净重',
    cell: ({ row }) => {
      const { nw, longCount, rowCount, columnCount } = row.original!
      return (nw || 0) * (longCount || 0) * (rowCount || 0) * (columnCount || 0)
    },
  },
  {
    header: '总毛重',
    cell: ({ row }) => {
      const { gw, longCount, rowCount, columnCount } = row.original!
      return (gw || 0) * (longCount || 0) * (rowCount || 0) * (columnCount || 0)
    },
  },
]
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-8xl flex flex-col gap-8">
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
            <template v-for="(item, index) in currentCargo" :key="item.uuid">
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
                  :items="
                    Object.entries(placeItem).map(([value, label]) => ({
                      value: Number(value),
                      label,
                    }))
                  "
                  value-key="value"
                  placeholder="摆放方式"
                  class="w-28"
                  @change="placeChange(index)"
                />
                <UInputNumber
                  v-model="item.fixedBoxCount"
                  class="w-28"
                  @change="fixedBoxCountChange(index)"
                />
                <UBadge :label="`当前长度：${item.fixedBoxLength || 0}`" />
                <UButton color="error" @click="currentCargo.splice(index, 1)">
                  <UIcon name="lucide:trash-2" />
                </UButton>
              </div>
            </template>
          </div>
          <UTable :columns="columns" :data="currentCargo"></UTable>
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
