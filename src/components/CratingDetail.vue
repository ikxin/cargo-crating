<script setup>
import { computed } from 'vue'

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

const truckData = computed(() => {
  if (!props.truck) return []

  const netWeightTotal = props.truck.cargo.reduce((sum, item) => {
    return sum + item.netWeight * item.mixedLayerCount * item.layerBoxCount
  }, 0)

  const grossWeightTotal = props.truck.cargo.reduce((sum, item) => {
    return sum + item.grossWeight * item.mixedLayerCount * item.layerBoxCount
  }, 0)

  const freeLength =
    props.truck.length -
    props.truck.cargo.reduce((sum, item) => {
      return sum + item.relativeLength * item.mixedLayerCount
    }, 0)

  const truckVolume =
    props.truck.length * props.truck.width * props.truck.height

  const cargoVolume = props.truck.cargo.reduce((sum, item) => {
    const volume =
      item.relativeLength * item.relativeWidth * item.relativeHeight
    return sum + volume * item.mixedLayerCount * item.layerBoxCount
  }, 0)

  return [
    {
      label: '货车名称',
      value: props.truck.name,
    },
    {
      label: '剩余长度',
      value: `${freeLength.toFixed(1)}m`,
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

const columns = [
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
    title: '最大排数',
    dataIndex: 'maxLayerCount',
    align: 'center',
  },
  {
    title: '最大箱数',
    dataIndex: 'maxBoxCount',
    align: 'center',
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
</script>

<template>
  <ACard title="装箱明细">
    <ADescriptions
      :data="truckData"
      bordered
      :column="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
      class="mb-4"
      size="large"
    ></ADescriptions>
    <ATable
      :columns
      :data="cargoData"
      :scroll="{
        x: 2000,
      }"
      :pagination="false"
      size="large"
    ></ATable>
  </ACard>
</template>
