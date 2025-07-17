<script setup>
import CratingDetail from '../components/CratingDetail.vue'
import { nextTick, ref, useTemplateRef } from 'vue'
import { useStorage, promiseTimeout } from '@vueuse/core'

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const formRef = useTemplateRef('form')

const timelineRef = useTemplateRef('timeline')

const cargoData = ref([
  {
    id: crypto.randomUUID(),
    needBoxCount: 100,
  },
])

const selectChange = (index) => {
  const cargo = database.value.cargo.find(
    (item) => item.id === cargoData.value[index].cargoId,
  )
  if (cargo) {
    cargoData.value[index] = {
      ...cargo,
      ...cargoData.value[index],
    }
  }
}

const targetTruck = ref()

const logData = ref([
  {
    time: new Date().toLocaleString(),
    content: '初始化货物数据',
  },
])

const addCargo = async () => {
  cargoData.value.push({
    id: crypto.randomUUID(),
    needBoxCount: 100,
  })
  await nextTick()
  formRef.value.scrollTop(100000)
}

const addLogRecord = async (content) => {
  await promiseTimeout(200)
  logData.value.push({ time: new Date().toLocaleString(), content })
  await nextTick()
  timelineRef.value.scrollTop(100000)
}

const startCalculation = async () => {
  logData.value = []

  const truckResult = []

  for await (const truck of database.value.truck) {
    await addLogRecord(`开始计算 ${truck.name} 的装载方案`)

    const cargoResult = []

    for await (let cargo of cargoData.value) {
      if (!cargo.cargoId || !cargo.needBoxCount) {
        await addLogRecord(`货物信息不完整，跳过计算`)
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

      const needLayerCount = Math.ceil(cargo.needBoxCount / layerBoxCount)
      const mixedLength = needLayerCount * layerLength

      cargoResult.push({
        ...cargo,
        rowBoxCount,
        columnBoxCount,
        layerLength,
        layerBoxCount,
        needLayerCount,
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
  const _targetTruck = truckResult[index]

  if (_targetTruck) {
    await addLogRecord(
      `最佳装载方案为 ${_targetTruck.name}，剩余空间 ${freeLength[index]}mm`,
    )
    for await (const cargo of _targetTruck.cargo) {
      await addLogRecord(
        `${cargo.name} ${cargo.placement}，每排可放 ${cargo.layerBoxCount} 箱，${cargo.needBoxCount} 箱需要使用 ${cargo.needLayerCount} 排，使用长度 ${cargo.mixedLength}mm`,
      )
    }
    targetTruck.value = _targetTruck
  } else {
    await addLogRecord('没有找到合适的装载方案')
  }
}
</script>

<template>
  <ASpace class="mb-4 w-full !items-start">
    <template #split>
      <ADivider direction="vertical" class="text-6xl" />
    </template>

    <div class="flex flex-col gap-2">
      <AButton type="primary" @click="addCargo">添加货物</AButton>
      <AButton @click="startCalculation">开始计算</AButton>
    </div>

    <AScrollbar ref="form" class="h-56 overflow-auto">
      <div class="flex flex-col gap-2 pr-4">
        <template v-for="(cargo, index) in cargoData" :key="cargo.id">
          <ASpace>
            <ASelect
              v-model="cargo.cargoId"
              allow-clear
              allow-search
              placeholder="选择货物"
              class="!w-36"
              @change="selectChange(index)"
            >
              <template v-for="item in database.cargo" :key="item.id">
                <AOption :value="item.id" :label="item.name" />
              </template>
            </ASelect>
            <AInputNumber
              v-model="cargo.needBoxCount"
              :min="0"
              :max="100000"
              mode="button"
              placeholder="所需箱数"
              class="!w-36"
            />
            <AButton
              @click="cargoData.splice(index, 1)"
              type="primary"
              status="danger"
            >
              删除
            </AButton>
          </ASpace>
        </template>
      </div>
    </AScrollbar>

    <AScrollbar ref="timeline" class="h-56 w-full overflow-auto">
      <ATimeline>
        <ATimelineItem v-for="(log, index) in logData" :key="index">
          <div class="flex items-center gap-2 text-nowrap">
            <span class="arco-timeline-item-label">{{ log.time }}</span>
            <span class="arco-timeline-item-content">{{ log.content }}</span>
          </div>
        </ATimelineItem>
      </ATimeline>
    </AScrollbar>
  </ASpace>
  <CratingDetail :truck="targetTruck" />
</template>

<style scoped>
:deep(.arco-space-item:last-child) {
  flex-grow: 1;
  overflow: auto;
}

:deep(.arco-space-item:last-child > .arco-scrollbar) {
  width: 100%;
}
</style>
