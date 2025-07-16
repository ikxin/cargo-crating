<script setup>
import { computed } from 'vue'

const props = defineProps({
  cargo: Array,
})

const data = computed(() => {
  return props.cargo?.map((item) => {
    return {
      ...item,
    }
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
  },
  {
    title: '混装长度',
    dataIndex: 'mixedLength',
  },
  {
    title: '混装箱数',
    dataIndex: 'mixedBoxCount',
  },
  {
    title: '混装净重',
    dataIndex: 'mixedNetWeight',
  },
  {
    title: '混装毛重',
    dataIndex: 'mixedGrossWeight',
  },
  {
    title: '横向箱数',
    dataIndex: 'rowCount',
  },
  {
    title: '纵向箱数',
    dataIndex: 'columnCount',
  },
  {
    title: '每排箱数',
    dataIndex: 'layerCount',
  },
  {
    title: '每排长度',
    dataIndex: 'layerLength',
  },
  {
    title: '最大排数',
    dataIndex: 'maxLayerCount',
  },
  {
    title: '最大箱数',
    dataIndex: 'maxBoxCount',
  },
  {
    title: '剩余长度',
    dataIndex: 'freeLength',
  },
  {
    title: '剩余宽度',
    dataIndex: 'freeWidth',
  },
  {
    title: '剩余高度',
    dataIndex: 'freeHeight',
  },
  {
    title: '每排净重',
    dataIndex: 'layerNetWeight',
  },
  {
    title: '每排毛重',
    dataIndex: 'layerGrossWeight',
  },
  {
    title: '最大净重',
    dataIndex: 'maxNetWeight',
  },
  {
    title: '最大毛重',
    dataIndex: 'maxGrossWeight',
  },
]
</script>

<template>
  <ACard title="装箱明细">
    <ATable
      :columns
      :data
      :scroll="{
        x: 1800,
        y: 1000,
      }"
    ></ATable>
  </ACard>
</template>
