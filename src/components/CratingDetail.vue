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

    // 混装箱数和重量
    cargo.mixedLayerCount = cargo.needLayerCount
    cargo.mixedBoxCount = cargo.mixedLayerCount * cargo.layerBoxCount
    cargo.mixedNetWeight = cargo.mixedBoxCount * cargo.netWeight
    cargo.mixedGrossWeight = cargo.mixedBoxCount * cargo.grossWeight

    // 最大排数和箱数
    cargo.maxLayerCount = Math.floor(truckHeight / cargo.relativeHeight)
    cargo.maxBoxCount = cargo.maxLayerCount * cargo.rowBoxCount

    // 剩余长宽高
    cargo.freeLength = truckLength - cargo.mixedLength
    cargo.freeWidth = truckWidth - cargo.relativeWidth * cargo.rowBoxCount
    cargo.freeHeight = truckHeight - cargo.relativeHeight * cargo.columnBoxCount

    // 每排净重和毛重
    cargo.layerNetWeight = cargo.mixedNetWeight / cargo.mixedLayerCount
    cargo.layerGrossWeight = cargo.mixedGrossWeight / cargo.mixedLayerCount

    // 最大净重和毛重
    cargo.maxNetWeight = cargo.netWeight * cargo.maxBoxCount
    cargo.maxGrossWeight = cargo.grossWeight * cargo.maxBoxCount

    return { ...cargo }
  })
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
    <ATable
      :columns
      :data="cargoData"
      :scroll="{
        x: 2100,
        y: 1000,
      }"
    ></ATable>
  </ACard>
</template>
