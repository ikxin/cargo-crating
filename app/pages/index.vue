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

const totalMixedBoxes = computed(() => {
  if (!currentTruck.value) return 0

  return currentCargo.value.reduce((total, item) => {
    if (!item.relativeWidth || !item.relativeHeight || !item.mixedRowsCount)
      return total

    const boxesPerLayer =
      Math.floor(currentTruck.value!.width / item.relativeWidth!) *
      Math.floor(currentTruck.value!.height / item.relativeHeight!)

    return total + (item.mixedRowsCount || 0) * boxesPerLayer
  }, 0)
})

const totalNetWeight = computed(() => {
  if (!currentTruck.value) return 0

  return currentCargo.value.reduce((total, item) => {
    if (
      !item.relativeWidth ||
      !item.relativeHeight ||
      !item.mixedRowsCount ||
      !item.netWeight
    )
      return total

    const boxesPerLayer =
      Math.floor(currentTruck.value!.width / item.relativeWidth!) *
      Math.floor(currentTruck.value!.height / item.relativeHeight!)

    return (
      total + (item.mixedRowsCount || 0) * boxesPerLayer * (item.netWeight || 0)
    )
  }, 0)
})

const totalGrossWeight = computed(() => {
  if (!currentTruck.value) return 0

  return currentCargo.value.reduce((total, item) => {
    if (
      !item.relativeWidth ||
      !item.relativeHeight ||
      !item.mixedRowsCount ||
      !item.grossWeight
    )
      return total

    const boxesPerLayer =
      Math.floor(currentTruck.value!.width / item.relativeWidth!) *
      Math.floor(currentTruck.value!.height / item.relativeHeight!)

    return (
      total +
      (item.mixedRowsCount || 0) * boxesPerLayer * (item.grossWeight || 0)
    )
  }, 0)
})

const currentCargo = ref<CargoType[]>([])

const placeItem = {
  1: '顺向平放',
  2: '横向平放',
  3: '顺向靠放（不推荐）',
  4: '横向靠放（不推荐）',
  5: '顺向立放（不推荐）',
  6: '横向立放（不推荐）',
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
      return `${row.original.name ? row.original.name : '未选择'}（${
        placeItem[row.original.place!] || '未选择'
      }）`
    },
  },
  {
    header: '混装排数',
    accessorKey: 'mixedRowsCount',
    cell: ({ row }) => {
      return row.original.mixedRowsCount || 0
    },
  },
  {
    header: '混装长度',
    accessorKey: 'mixedTotalLength',
    cell: ({ row }) => {
      return row.original.mixedTotalLength || 0
    },
  },
  {
    header: '混装箱数',
    meta: {
      class: {
        th: 'bg-yellow-100',
        td: 'bg-yellow-100',
      },
    },
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, mixedRowsCount } = row.original!
      return (
        (mixedRowsCount || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      )
    },
  },
  {
    header: '混装净重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, netWeight, mixedRowsCount } =
        row.original!
      return (
        (mixedRowsCount || 0) *
        (netWeight || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      ).toFixed(2)
    },
  },
  {
    header: '混装毛重',
    cell: ({ row }) => {
      const { relativeWidth, relativeHeight, grossWeight, mixedRowsCount } =
        row.original!
      return (
        (mixedRowsCount || 0) *
        (grossWeight || 0) *
        (Math.floor(currentTruck.value!.width / relativeWidth!) || 0) *
        (Math.floor(currentTruck.value!.height / relativeHeight!) || 0)
      ).toFixed(2)
    },
  },
  {
    header: '横向箱数',
    cell: ({ row }) => {
      const { relativeWidth } = row.original!
      return Math.floor(currentTruck.value!.width / relativeWidth!) || 0
    },
  },
  {
    header: '横向箱数',
    cell: ({ row }) => {
      const { relativeHeight } = row.original!
      return Math.floor(currentTruck.value!.height / relativeHeight!) || 0
    },
  },
  {
    header: '每排箱数',
    meta: {
      class: {
        th: 'bg-yellow-100',
        td: 'bg-yellow-100',
      },
    },
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
    header: '最大净重',
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
    header: '最大毛重',
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

const columnPinning = ref({
  left: ['name'],
})

const addCargo = () => {
  if (!currentTruck.value) {
    alert('请先选择货车型号')
    return
  }
  currentCargo.value.push({ id: nanoid() })
}

const exportTableData = () => {
  if (!currentTruck.value || currentCargo.value.length === 0) {
    alert('请先选择货车型号并添加货物')
    return
  }

  const headers = columns.map((col) => String(col.header))

  const exportData = [headers]

  currentCargo.value.forEach((item) => {
    if (!item.name) return

    const row = [
      item.name || '未选择',
      placeItem[item.place!] || '未选择',
      item.mixedRowsCount || 0,
      item.mixedTotalLength || 0,
      // 混装箱数计算
      (item.mixedRowsCount || 0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 混装净重计算
      (item.mixedRowsCount || 0) *
        (item.netWeight || 0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 混装毛重计算
      (item.mixedRowsCount || 0) *
        (item.grossWeight || 0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 横箱数
      Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) || 0,
      // 纵箱数
      Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) || 0,
      // 每排箱数
      (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) || 0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 最大排数
      Math.floor(currentTruck.value!.length / (item.relativeLength || 1)) || 0,
      // 最大箱数
      (Math.floor(currentTruck.value!.length / (item.relativeLength || 1)) ||
        0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 每排长度
      item.relativeLength || 0,
      // 剩余长度
      currentTruck.value!.length % (item.relativeLength || 1),
      // 剩余宽度
      currentTruck.value!.width % (item.relativeWidth || 1),
      // 剩余高度
      currentTruck.value!.height % (item.relativeHeight || 1),
      // 每排净重
      (item.netWeight || 0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 每排毛重
      (item.grossWeight || 0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 总净重
      (item.netWeight || 0) *
        (Math.floor(currentTruck.value!.length / (item.relativeLength || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
      // 总毛重
      (item.grossWeight || 0) *
        (Math.floor(currentTruck.value!.length / (item.relativeLength || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.width / (item.relativeWidth || 1)) ||
          0) *
        (Math.floor(currentTruck.value!.height / (item.relativeHeight || 1)) ||
          0),
    ]

    exportData.push(row as string[])
  })

  const csvContent = exportData
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        )
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `货车装箱计算_${new Date().toLocaleString()}.csv`
  )
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto px-4 py-8 flex flex-col gap-8">
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
              <UBadge
                :label="`长 ${currentTruck?.length || 0}mm 宽 ${
                  currentTruck?.width || 0
                }mm 高 ${currentTruck?.height || 0}mm`"
              />
              <UBadge
                :label="`剩余长度：${remainingLength}mm`"
                :color="remainingLength >= 0 ? 'primary' : 'error'"
              />
              <UBadge :label="`总箱数：${totalMixedBoxes} 箱`" />
              <UBadge :label="`总净重：${totalNetWeight.toFixed(2)}kg`" />
              <UBadge :label="`总毛重：${totalGrossWeight.toFixed(2)}kg`" />
            </div>
          </UFormField>
          <div class="flex gap-4">
            <UButton class="w-fit" @click="addCargo()">添加货物</UButton>
            <UButton class="w-fit" @click="exportTableData">
              <UIcon name="lucide:download" class="mr-2" />
              导出表格
            </UButton>
          </div>
          <div class="flex flex-col gap-4 text-base">
            <template v-for="(item, index) in currentCargo" :key="item.uuid">
              <div class="flex gap-2 items-center h-10">
                <USelectMenu
                  v-model="currentCargo[index]!.cargoId"
                  value-key="id"
                  label-key="name"
                  :items="cargoData"
                  :search-input="{
                    placeholder: '搜索...',
                  }"
                  class="w-48"
                  placeholder="货物规格"
                  @change="cargoChange(index)"
                />
                <UBadge
                  class="h-8"
                  :label="`长 ${currentCargo[index]?.length || 0}mm 宽 ${
                    currentCargo[index]?.width || 0
                  }mm 高 ${currentCargo[index]?.height || 0}mm`"
                />
                <UBadge
                  class="h-8"
                  :label="`净重 ${currentCargo[index]?.netWeight || 0}kg 毛重 ${
                    currentCargo[index]?.grossWeight || 0
                  }kg`"
                />
                <USelect
                  v-model="currentCargo[index]!.place"
                  :items="
                    Object.entries(placeItem).map(([value, label]) => ({
                      value: Number(value),
                      label,
                      avatar: {
                        src: `/${value}.png`,
                      },
                    }))
                  "
                  value-key="value"
                  placeholder="摆放方式"
                  class="w-58"
                  :ui="{
                    itemLeadingAvatar: 'rounded-md',
                    itemLeadingAvatarSize: 'xl',
                  }"
                  @change="placeChange(index)"
                />
                <template v-if="currentCargo[index]?.place">
                  <img
                    :src="`/${currentCargo[index]?.place}.png`"
                    class="rounded h-10 object-cover hover:scale-400 hover:z-20 transition-transform duration-300 z-10"
                  />
                </template>
                <UInputNumber
                  v-model="item.mixedRowsCount"
                  class="w-28"
                  :min="0"
                  @change="fixedBoxCountChange(index)"
                />
                <UBadge
                  class="h-8"
                  :label="`每排 ${(
                      (Math.floor(currentTruck!.width / item?.relativeWidth!) || 0) *
                      (Math.floor(currentTruck!.height / item?.relativeHeight!) || 0)
                    )} 箱 
                    混装箱数 ${(
                      (item?.mixedRowsCount || 0) *
                      (Math.floor(currentTruck!.width /item?.relativeWidth!) || 0) *
                      (Math.floor(currentTruck!.height / item?.relativeHeight!) || 0)
                    )} 箱
                  `"
                />
                <UButton
                  size="xl"
                  color="error"
                  @click="currentCargo.splice(index, 1)"
                >
                  <UIcon name="lucide:trash-2" />
                </UButton>
              </div>
            </template>
          </div>
          <UTable
            v-model:column-pinning="columnPinning"
            :columns="columns"
            :data="currentCargo"
          >
          </UTable>
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
    </div>
  </div>
</template>
