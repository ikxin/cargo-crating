<script setup>
import CratingDetail from '../components/CratingDetail.vue'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const cargoData = ref([
  {
    id: crypto.randomUUID(),
    needBoxCount: 100,
  },
])

const selectChange = (index, value) => {
  const cargo = database.value.cargo.find((item) => item.id === value)
  cargoData.value[index] = {
    ...cargoData.value[index],
    ...cargo,
    id: cargoData.value[index].id,
    cargoId: value,
  }
}

const targetTruck = ref()

const addCargo = async () => {
  cargoData.value.push({
    id: crypto.randomUUID(),
    needBoxCount: 100,
  })
}

const startCalculation = () => {
  const truckResult = []

  for (const truck of database.value.truck) {
    const cargoResult = []

    for (let cargo of cargoData.value) {
      if (!cargo.cargoId || !cargo.needBoxCount) {
        continue
      }

      cargo = { ...cargo }

      const freeWidth = {
        placement1: truck.width % cargo.width,
        placement2: truck.width % cargo.length,
      }

      if (freeWidth.placement1 <= freeWidth.placement2) {
        cargo.placement = '顺向摆放'
        cargo.relativeLength = cargo.length
        cargo.relativeWidth = cargo.width
        cargo.relativeHeight = cargo.height
      } else {
        cargo.placement = '横向摆放'
        cargo.relativeLength = cargo.width
        cargo.relativeWidth = cargo.length
        cargo.relativeHeight = cargo.height
      }

      const rowBoxCount = Math.floor(truck.width / cargo.relativeWidth)
      const columnBoxCount = Math.floor(truck.height / cargo.relativeHeight)
      const layerLength = cargo.relativeLength
      const layerBoxCount = rowBoxCount * columnBoxCount

      const mixedLayerCount = Math.ceil(cargo.needBoxCount / layerBoxCount)
      const mixedLength = mixedLayerCount * layerLength

      cargoResult.push({
        ...cargo,
        rowBoxCount,
        columnBoxCount,
        layerLength,
        layerBoxCount,
        mixedLayerCount,
        mixedLength,
      })
    }

    const mixedLengthTotal = cargoResult.reduce((acc, cur) => {
      return acc + cur.mixedLength
    }, 0)

    truckResult.push({
      ...truck,
      cargo: cargoResult,
      mixedLengthTotal,
    })
  }

  const freeLength = truckResult.map(
    (truck) => truck.length - truck.mixedLengthTotal,
  )

  const index = freeLength.indexOf(
    Math.min(...freeLength.filter((item) => item >= 0)),
  )

  if (truckResult[index]) {
    targetTruck.value = { ...truckResult[index] }
  } else {
    Message.info('没有找到合适的卡车')
  }
}
</script>

<template>
  <ASpace class="mb-4 w-full" direction="vertical">
    <template #split>
      <ADivider :margin="8" />
    </template>

    <div class="flex gap-2">
      <AButton type="primary" @click="addCargo">添加货物</AButton>
      <AButton @click="startCalculation">开始计算</AButton>
    </div>

    <div class="flex flex-col gap-2">
      <template v-for="(cargo, index) in cargoData" :key="cargo.id">
        <AForm :model="cargo" layout="inline">
          <AFormItem label="选择货物" show-colon>
            <ASelect
              v-model="cargo.cargoId"
              allow-search
              @change="selectChange(index, $event)"
              class="!w-48"
            >
              <template v-for="item in database.cargo" :key="item.id">
                <AOption :value="item.id" :label="item.name" />
              </template>
            </ASelect>
          </AFormItem>
          <AFormItem label="所需箱数" show-colon>
            <AInputNumber
              v-model="cargo.needBoxCount"
              :min="0"
              :max="100000"
              mode="button"
              class="!w-48"
            />
          </AFormItem>
          <AButton
            @click="cargoData.splice(index, 1)"
            type="primary"
            status="danger"
          >
            删除
          </AButton>
        </AForm>
      </template>
    </div>
  </ASpace>
  <CratingDetail :truck="targetTruck" />
</template>
