<script lang="ts" setup>
import { useStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  colorMode: 'light',
})

const truckData = useStorage<SpecsType[]>('truck-data', [])

const cargoData = useStorage<SpecsType[]>('cargo-data', [])

const selectedTruck = ref()

const currentTruck = computed(() => {
  return truckData.value.find((item) => item.id === selectedTruck.value)
})

const remainingLength = computed(() => {
  console.log(1)

  let totalCargoLength = 0
  currentCargo.value.forEach((item) => {
    totalCargoLength += item?.mixedTotalLength || 0
  })
  if (currentTruck.value) {
    return currentTruck.value.length - totalCargoLength
  } else {
    return 0
  }
})

const currentCargo = ref<CargoType[]>([])

const placeItem = {
  1: '顺向平放',
  2: '横向平放',
  3: '顺向靠放',
  4: '横向靠放',
  5: '顺向立放',
  6: '横向立放',
}

const cargoChange = (index: number) => {
  const cargo = cargoData.value.find(
    (item) => item.id === currentCargo.value[index]?.cargoId
  )
  currentCargo.value[index] = {
    ...cargo,
    id: currentCargo.value[index]?.id,
  }
}

const placeChange = (index: number) => {
  const cargo = currentCargo.value[index]!

  if (!cargo) return

  if (cargo.place === 1) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.length || 0,
      relativeWidth: cargo.width || 0,
      relativeHeight: cargo.height || 0,
    }
  }

  if (cargo.place === 2) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.width || 0,
      relativeWidth: cargo.length || 0,
      relativeHeight: cargo.height || 0,
    }
  }

  if (cargo.place === 3) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.length || 0,
      relativeWidth: cargo.height || 0,
      relativeHeight: cargo.width || 0,
    }
  }

  if (cargo.place === 4) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.height || 0,
      relativeWidth: cargo.length || 0,
      relativeHeight: cargo.width || 0,
    }
  }

  if (cargo.place === 5) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.width || 0,
      relativeWidth: cargo.height || 0,
      relativeHeight: cargo.length || 0,
    }
  }

  if (cargo.place === 6) {
    currentCargo.value[index] = {
      ...cargo,
      relativeLength: cargo.height || 0,
      relativeWidth: cargo.width || 0,
      relativeHeight: cargo.length || 0,
    }
  }

  fixedBoxCountChange(index)
}

const fixedBoxCountChange = (index: number) => {
  const cargo = currentCargo.value[index]!
  cargo.mixedTotalLength = cargo.mixedRowsCount! * cargo.relativeLength!
  currentCargo.value[index] = { ...cargo }
}

const columns: TableColumn<CargoType>[] = [
  {
    header: '货物规格',
    accessorKey: 'name',
    cell: ({ row }) => {
      return row.original.name ? row.original.name : '未选择'
    },
  },
  {
    header: '摆放方式',
    accessorKey: 'place',
    cell: ({ row }) => {
      return placeItem[row.original.place!] || '未选择'
    },
  },
  {
    header: '横箱数',
    cell: ({ row }) => {
      const { relativeWidth } = row.original!
      return Math.floor(currentTruck.value!.width / relativeWidth!) || 0
    },
  },
  {
    header: '纵箱数',
    cell: ({ row }) => {
      const { relativeHeight } = row.original!
      return Math.floor(currentTruck.value!.height / relativeHeight!) || 0
    },
  },
  {
    header: '每排箱数',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight } = row.original!
      return (
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '最大排数',
    cell: ({ row }) => {
      const { relativeLength } = row.original!
      return Math.floor(currentTruck.value!.length / relativeLength!) || 0
    },
  },
  {
    header: '最大箱数',
    cell: ({ row }) => {
      const { relativeLength, relativeWidth, relativeHeight } = row.original!
      return (
        (Math.floor(currentTruck.value!.length / relativeLength!) || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '每排长度',
    cell: ({ row }) => {
      return row.original.relativeLength || 0
    },
  },
  {
    header: '剩余长度',
    cell: ({ row }) => {
      return currentTruck.value!.length % (row.original.relativeLength || 1)
    },
  },
  {
    header: '剩余宽度',
    cell: ({ row }) => {
      return currentTruck.value!.width % (row.original.relativeWidth || 1)
    },
  },
  {
    header: '剩余高度',
    cell: ({ row }) => {
      return currentTruck.value!.height % (row.original.relativeHeight || 1)
    },
  },
  {
    header: '每排净重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, netWeight } = row.original!
      return (
        (netWeight || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '每排毛重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, grossWeight } = row.original!
      return (
        (grossWeight || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '总净重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, relativeLength, netWeight } =
        row.original!
      return (
        (netWeight || 0) *
        (Math.floor(currentTruck.value!.length / relativeLength!) || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '总毛重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, relativeLength, grossWeight } =
        row.original!
      return (
        (grossWeight || 0) *
        (Math.floor(currentTruck.value!.length / relativeLength!) || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
]

const addCargo = () => {
  if (!currentTruck.value) {
    alert('请先选择货车型号')
    return
  }
  currentCargo.value.push({ id: nanoid() })
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 flex flex-col gap-8">
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
                value-key="id"
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
          <UButton class="w-fit" @click="addCargo()">添加货物</UButton>
          <div class="flex flex-col gap-4 text-base">
            <template v-for="(item, index) in currentCargo" :key="item.uuid">
              <div class="flex gap-2">
                <USelect
                  v-model="currentCargo[index]!.cargoId"
                  value-key="id"
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
                  v-model="item.mixedRowsCount"
                  class="w-28"
                  @change="fixedBoxCountChange(index)"
                />
                <UBadge :label="`当前长度：${item.mixedTotalLength || 0}`" />
                <UButton color="error" @click="currentCargo.splice(index, 1)">
                  <UIcon name="lucide:trash-2" />
                </UButton>
              </div>
            </template>
          </div>
          <UTable :columns="columns" :data="currentCargo"></UTable>
        </div>
      </UCard>

      <div class="grid md:grid-cols-2 gap-8">
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
      </div>

      <footer class="mt-12 text-center text-gray-500 text-sm">
        <p>货车装箱计算器 &copy; 2025 | 物流优化工具</p>
      </footer>
    </div>
  </div>
</template>
