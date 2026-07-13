<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import Sortable from 'sortablejs'
import { useStorage } from '@vueuse/core'
import CargoPreview from './CargoPreview.vue'

const props = defineProps({
  truck: Object,
})

const cargoData = computed(() => {
  return props.truck?.cargo.map((item) => {
    const {
      length: truckLength,
      width: truckWidth,
      height: truckHeight,
    } = props.truck

    const cargo = { ...item }

    // 混装箱数
    cargo.mixedBoxCount = cargo.mixedLayerCount * cargo.layerBoxCount

    // 混装重量
    cargo.mixedNetWeight = cargo.mixedBoxCount * cargo.netWeight
    cargo.mixedGrossWeight = cargo.mixedBoxCount * cargo.grossWeight

    // 最大排数和箱数
    cargo.maxLayerCount = Math.floor(truckLength / cargo.relativeLength)
    cargo.maxBoxCount = cargo.maxLayerCount * cargo.layerBoxCount

    // 剩余长宽高
    cargo.freeLength = truckLength - cargo.relativeLength * cargo.maxLayerCount
    cargo.freeWidth = truckWidth - cargo.relativeWidth * cargo.rowBoxCount
    cargo.freeHeight = truckHeight - cargo.relativeHeight * cargo.columnBoxCount

    // 每排重量
    cargo.layerNetWeight = cargo.netWeight * cargo.layerBoxCount
    cargo.layerGrossWeight = cargo.grossWeight * cargo.layerBoxCount

    // 最大重量
    cargo.maxNetWeight = cargo.netWeight * cargo.maxBoxCount
    cargo.maxGrossWeight = cargo.grossWeight * cargo.maxBoxCount

    return { ...cargo }
  })
})

const cargoVolumeMm3 = computed(() => {
  if (!props.truck) return 0
  return props.truck.cargo.reduce((sum, item) => {
    const volume =
      item.relativeLength * item.relativeWidth * item.relativeHeight
    const boxCount =
      item.needBoxCount ?? item.mixedLayerCount * item.layerBoxCount
    return sum + volume * boxCount
  }, 0)
})

const volumetricDivisor = ref(6000)

const volumetricWeight = computed(() => {
  if (!props.truck || !cargoVolumeMm3.value) {
    return 0
  } else {
    return cargoVolumeMm3.value / 1000 / volumetricDivisor.value
  }
})

const truckData = computed(() => {
  if (!props.truck) return []

  const netWeightTotal = props.truck.cargo.reduce((sum, item) => {
    const boxCount =
      item.needBoxCount ?? item.mixedLayerCount * item.layerBoxCount
    return sum + item.netWeight * boxCount
  }, 0)

  const grossWeightTotal = props.truck.cargo.reduce((sum, item) => {
    const boxCount =
      item.needBoxCount ?? item.mixedLayerCount * item.layerBoxCount
    return sum + item.grossWeight * boxCount
  }, 0)

  const freeLength =
    props.truck.length -
    props.truck.cargo.reduce((sum, item) => {
      return sum + item.relativeLength * item.mixedLayerCount
    }, 0)

  const truckVolume =
    props.truck.length * props.truck.width * props.truck.height

  const cargoVolume = cargoVolumeMm3.value

  return [
    {
      label: '货车名称',
      value: props.truck.name,
    },
    {
      label: '剩余长度',
      value: `${freeLength.toFixed(1)}mm`,
      class: freeLength < 0 ? 'bg-[#F53F3F] text-white' : '',
    },
    {
      label: '货车长度',
      value: `${props.truck.length}mm`,
    },
    {
      label: '货车宽度',
      value: `${props.truck.width}mm`,
    },
    {
      label: '货车高度',
      value: `${props.truck.height}mm`,
    },
    {
      label: '货车体积',
      value: `${(truckVolume / 1000000000).toFixed(2)}m³`,
    },
    {
      label: '货物体积',
      value: `${(cargoVolume / 1000000000).toFixed(2)}m³`,
    },
    {
      label: '使用率',
      value: `${((cargoVolume / truckVolume) * 100).toFixed(2)}%`,
    },
    {
      label: '货物净重',
      value: `${netWeightTotal.toFixed(1)}kg`,
    },
    {
      label: '货物毛重',
      value: `${grossWeightTotal.toFixed(1)}kg`,
    },
  ]
})

const baseColumns = [
  {
    title: '货物名称',
    dataIndex: 'name',
    fixed: 'left',
    width: 120,
    align: 'center',
  },
  {
    title: '摆放方式',
    dataIndex: 'placement',
    fixed: 'left',
    width: 120,
    align: 'center',
  },
  {
    title: '混装排数',
    dataIndex: 'mixedLayerCount',
    align: 'center',
  },
  {
    title: '混装长度',
    dataIndex: 'mixedLength',
    align: 'center',
  },
  {
    title: '混装箱数',
    dataIndex: 'mixedBoxCount',
    align: 'center',
    bodyCellClass: '!bg-yellow-100',
  },
  {
    title: '混装净重',
    dataIndex: 'mixedNetWeight',
    align: 'center',
    render({ record }) {
      return `${record.mixedNetWeight.toFixed(1)}kg`
    },
  },
  {
    title: '混装毛重',
    dataIndex: 'mixedGrossWeight',
    align: 'center',
    render({ record }) {
      return `${record.mixedGrossWeight.toFixed(1)}kg`
    },
  },
  {
    title: '横向箱数',
    dataIndex: 'rowBoxCount',
    align: 'center',
  },
  {
    title: '纵向箱数',
    dataIndex: 'columnBoxCount',
    align: 'center',
  },
  {
    title: '每排长度',
    dataIndex: 'layerLength',
    align: 'center',
  },
  {
    title: '每排箱数',
    dataIndex: 'layerBoxCount',
    align: 'center',
    bodyCellClass: '!bg-yellow-100',
  },
  {
    title: '每排净重',
    dataIndex: 'layerNetWeight',
    align: 'center',
    render({ record }) {
      return `${record.layerNetWeight.toFixed(1)}kg`
    },
  },
  {
    title: '每排毛重',
    dataIndex: 'layerGrossWeight',
    align: 'center',
    render({ record }) {
      return `${record.layerGrossWeight.toFixed(1)}kg`
    },
  },
  {
    title: '剩余长度',
    dataIndex: 'freeLength',
    align: 'center',
  },
  {
    title: '剩余宽度',
    dataIndex: 'freeWidth',
    align: 'center',
  },
  {
    title: '剩余高度',
    dataIndex: 'freeHeight',
    align: 'center',
  },
  {
    title: '最大排数',
    dataIndex: 'maxLayerCount',
    align: 'center',
  },
  {
    title: '最大箱数',
    dataIndex: 'maxBoxCount',
    align: 'center',
    bodyCellClass: '!bg-yellow-100',
  },
  {
    title: '最大净重',
    dataIndex: 'maxNetWeight',
    align: 'center',
    render({ record }) {
      return `${record.maxNetWeight.toFixed(1)}kg`
    },
  },
  {
    title: '最大毛重',
    dataIndex: 'maxGrossWeight',
    align: 'center',
    render({ record }) {
      return `${record.maxGrossWeight.toFixed(1)}kg`
    },
  },
]

const columnSetting = useStorage(
  'cargo-crating-detail-columns',
  baseColumns.map((item) => ({ dataIndex: item.dataIndex, visible: true })),
)

const normalizeColumnSetting = () => {
  const exists = new Set(baseColumns.map((item) => item.dataIndex))
  const setting = Array.isArray(columnSetting.value) ? columnSetting.value : []
  const saved = setting.filter((item) => exists.has(item.dataIndex))
  const savedKeys = new Set(saved.map((item) => item.dataIndex))
  const missing = baseColumns
    .filter((item) => !savedKeys.has(item.dataIndex))
    .map((item) => ({ dataIndex: item.dataIndex, visible: true }))

  columnSetting.value = [...saved, ...missing]
}

normalizeColumnSetting()

const visibleColumns = computed(() => {
  return columnSetting.value
    .filter((item) => item.visible)
    .map((item, index) => {
      const col = baseColumns.find((col) => col.dataIndex === item.dataIndex)
      if (!col) return null

      return {
        ...col,
        fixed:
          index < 2 && ['name', 'placement'].includes(col.dataIndex)
            ? 'left'
            : undefined,
      }
    })
    .filter(Boolean)
})

const tableScrollX = computed(() => {
  return Math.max(
    800,
    visibleColumns.value.reduce((sum, item) => sum + (item.width || 110), 0),
  )
})

const columnListRef = useTemplateRef('columnList')
let columnSortable

const initColumnDraggable = async (visible = true) => {
  if (!visible) return

  await nextTick()
  await new Promise((resolve) => setTimeout(resolve))

  const listElement = columnListRef.value
  if (!listElement) return

  columnSortable?.destroy()
  columnSortable = Sortable.create(listElement, {
    animation: 150,
    handle: '.column-drag-handle',
    ghostClass: 'sortable-ghost',
    onEnd(event) {
      if (event.oldIndex === event.newIndex) return

      const list = [...columnSetting.value]
      const [column] = list.splice(event.oldIndex, 1)
      list.splice(event.newIndex, 0, column)
      columnSetting.value = list
    },
  })
}

onBeforeUnmount(() => columnSortable?.destroy())

const weightColumnKeys = new Set([
  'mixedNetWeight',
  'mixedGrossWeight',
  'layerNetWeight',
  'layerGrossWeight',
  'maxNetWeight',
  'maxGrossWeight',
])

const getExportValue = (item, col) => {
  if (col.dataIndex === 'name') return item.name || '未选择'
  if (col.dataIndex === 'placement') return item.placement || '未选择'
  if (weightColumnKeys.has(col.dataIndex)) {
    return `${(item[col.dataIndex] || 0).toFixed(1)}kg`
  }
  return item[col.dataIndex] ?? 0
}

const exportData = () => {
  if (!props.truck || !cargoData.value || cargoData.value.length === 0) {
    alert('请先选择货车型号并添加货物')
    return
  }

  const exportDataArray = []

  // 货车信息表头
  const truckHeaders = truckData.value.map((item) => item.label)
  exportDataArray.push(truckHeaders)

  // 货车信息数据
  const truckValues = truckData.value.map((item) => item.value)
  exportDataArray.push(truckValues)

  // 添加空行分隔
  exportDataArray.push([])

  // 货物数据表头
  const cargoHeaders = visibleColumns.value.map((col) => col.title)
  exportDataArray.push(cargoHeaders)

  // 货物数据
  cargoData.value.forEach((item) => {
    const row = visibleColumns.value.map((col) => getExportValue(item, col))
    exportDataArray.push(row)
  })

  const csvContent = exportDataArray
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell,
        )
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `装箱明细_${new Date().toLocaleString().replace(/[/:]/g, '-')}.csv`,
  )
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <ACard title="装箱明细">
    <template #extra>
      <ASpace>
        <APopover
          trigger="click"
          position="bottom"
          @popup-visible-change="initColumnDraggable"
        >
          <AButton>列设置</AButton>
          <template #content>
            <div
              ref="columnList"
              class="flex max-h-96 w-56 flex-col gap-2 overflow-auto"
            >
              <div
                v-for="item in columnSetting"
                :key="item.dataIndex"
                :data-column-key="item.dataIndex"
                class="flex items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-gray-50"
              >
                <ACheckbox v-model="item.visible">
                  {{
                    baseColumns.find((col) => col.dataIndex === item.dataIndex)
                      ?.title
                  }}
                </ACheckbox>
                <span
                  class="column-drag-handle inline-flex cursor-move items-center text-gray-400 hover:text-gray-700"
                  title="拖拽排序"
                >
                  <IconMenu />
                </span>
              </div>
            </div>
          </template>
        </APopover>
        <AButton type="primary" @click="exportData">
          <template #icon>
            <IconExport />
          </template>
          <template #default>导出</template>
        </AButton>
      </ASpace>
    </template>
    <ADescriptions
      bordered
      :column="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
      class="mb-4"
      size="large"
    >
      <template v-for="item in truckData" :key="item.label">
        <ADescriptionsItem :label="item.label">
          <div class="px-5 py-2.5" :class="[item.class]">
            {{ item.value }}
          </div>
        </ADescriptionsItem>
      </template>
    </ADescriptions>
    <ADescriptions bordered class="mb-4" size="large">
      <ADescriptionsItem label="体积换算">
        <div class="flex items-center gap-2 px-5 py-2.5">
          <span>{{ (cargoVolumeMm3 / 1000).toFixed(0) }}cm³</span>
          <span>÷</span>
          <ASelect
            v-model="volumetricDivisor"
            :options="[
              { label: '5000', value: 5000 },
              { label: '6000', value: 6000 },
            ]"
            style="width: 90px"
            size="small"
          />
          <span>= {{ volumetricWeight.toFixed(1) }}kg</span>
        </div>
      </ADescriptionsItem>
    </ADescriptions>
    <ATable
      :columns="visibleColumns"
      :data="cargoData"
      :scroll="{
        x: tableScrollX,
      }"
      :pagination="false"
      size="large"
    ></ATable>
    <CargoPreview :truck="truck" class="mt-4" />
  </ACard>
</template>

<style scoped>
:deep(.arco-descriptions-item-value) {
  padding: 0 !important;
}
</style>
