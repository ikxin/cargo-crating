<script setup>
import CratingDetail from '../components/CratingDetail.vue'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const truckInfo = ref()

const cargoData = ref([
  {
    id: crypto.randomUUID(),
    mixedLayerCount: 10,
    placement: '顺向摆放',
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
    mixedLayerCount: 10,
    placement: '顺向摆放',
  })
}

const startCalculation = () => {
  const cargoResult = []
  const truck = truckInfo.value

  for (let cargo of cargoData.value) {
    if (!cargo.cargoId || !cargo.mixedLayerCount) {
      continue
    }

    cargo = { ...cargo }

    if (cargo.placement === '顺向摆放') {
      cargo.relativeLength = cargo.length
      cargo.relativeWidth = cargo.width
      cargo.relativeHeight = cargo.height
    }

    if (cargo.placement === '横向摆放') {
      cargo.relativeLength = cargo.width
      cargo.relativeWidth = cargo.length
      cargo.relativeHeight = cargo.height
    }

    if (cargo.placement === '顺向靠放') {
      cargo.relativeLength = cargo.length
      cargo.relativeWidth = cargo.height
      cargo.relativeHeight = cargo.width
    }

    if (cargo.placement === '横向靠放') {
      cargo.relativeLength = cargo.height
      cargo.relativeWidth = cargo.length
      cargo.relativeHeight = cargo.width
    }

    if (cargo.placement === '顺向立放') {
      cargo.relativeLength = cargo.width
      cargo.relativeWidth = cargo.height
      cargo.relativeHeight = cargo.length
    }

    if (cargo.placement === '横向立放') {
      cargo.relativeLength = cargo.height
      cargo.relativeWidth = cargo.width
      cargo.relativeHeight = cargo.length
    }

    const rowBoxCount = Math.floor(truck.width / cargo.relativeWidth)
    const columnBoxCount = Math.floor(truck.height / cargo.relativeHeight)
    const layerLength = cargo.relativeLength
    const layerBoxCount = rowBoxCount * columnBoxCount
    const mixedLength = cargo.mixedLayerCount * layerLength

    cargoResult.push({
      ...cargo,
      rowBoxCount,
      columnBoxCount,
      layerLength,
      layerBoxCount,
      mixedLength,
    })
  }

  targetTruck.value = {
    ...truck,
    cargo: cargoResult,
  }
}
</script>

<template>
  <ASpace class="mb-4 w-full" direction="vertical">
    <template #split>
      <ADivider :margin="8" />
    </template>

    <div class="flex gap-2">
      <ASelect
        v-model="truckInfo"
        allow-search
        placeholder="选择货车"
        class="!w-36"
        value-key="name"
      >
        <template v-for="item in database.truck" :key="item.id">
          <AOption :value="item" :label="item.name" />
        </template>
      </ASelect>
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
          <AFormItem label="摆放方式" show-colon>
            <ASelect v-model="cargo.placement" class="!w-48">
              <AOption value="顺向摆放">顺向摆放</AOption>
              <AOption value="横向摆放">横向摆放</AOption>
              <AOption value="顺向靠放" label="顺向靠放">
                <div class="flex items-center gap-2">
                  <span class="flex-1">顺向靠放</span>
                  <ATag color="red">不推荐</ATag>
                </div>
              </AOption>
              <AOption value="横向靠放" label="横向靠放">
                <div class="flex items-center gap-2">
                  <span class="flex-1">横向靠放</span>
                  <ATag color="red" size="small">不推荐</ATag>
                </div>
              </AOption>
              <AOption value="顺向立放" label="顺向立放">
                <div class="flex items-center gap-2">
                  <span class="flex-1">顺向立放</span>
                  <ATag color="red" size="small">不推荐</ATag>
                </div>
              </AOption>
              <AOption value="横向立放" label="横向立放">
                <div class="flex items-center gap-2">
                  <span class="flex-1">横向立放</span>
                  <ATag color="red" size="small">不推荐</ATag>
                </div>
              </AOption>
            </ASelect>
          </AFormItem>
          <AFormItem label="混装排数" show-colon>
            <AInputNumber
              v-model="cargo.mixedLayerCount"
              :min="0"
              :max="100000"
              :precision="0"
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
