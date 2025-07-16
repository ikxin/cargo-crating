<script setup>
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
    total: 100,
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

const targetCargo = ref()

const logData = ref([
  {
    time: new Date().toLocaleString(),
    content: '初始化货物数据',
  },
])

const addCargo = async () => {
  cargoData.value.push({
    id: crypto.randomUUID(),
    total: 100,
  })
  await nextTick()
  formRef.value.scrollTop(100000)
}

const addLogRecord = async (content) => {
  await promiseTimeout(400)
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
      if (!cargo.cargoId || !cargo.total) {
        await addLogRecord(`货物信息不完整，跳过计算`)
        continue
      }

      cargo = { ...cargo }

      const freeWidth = {
        placementA: truck.width % cargo.width,
        placementB: truck.width % cargo.length,
      }

      if (freeWidth.placementA <= freeWidth.placementB) {
        cargo.placement = 'A'
        cargo.relativeLength = cargo.length
        cargo.relativeWidth = cargo.width
        cargo.relativeHeight = cargo.height
      } else {
        cargo.placement = 'B'
        cargo.relativeLength = cargo.width
        cargo.relativeWidth = cargo.length
        cargo.relativeHeight = cargo.height
      }

      // 每行箱数
      const rowCount = Math.floor(truck.width / cargo.relativeWidth)
      // 每列箱数
      const columnCount = Math.floor(truck.height / cargo.relativeHeight)
      // 每层箱数
      const layerCount = rowCount * columnCount
      // 所需层数
      const layerNeeded = Math.ceil(cargo.total / layerCount)
      // 每层长度
      const layerLength = cargo.relativeLength
      // 货物长度
      const cargoLength = layerNeeded * layerLength

      cargoResult.push({
        ...cargo,
        rowCount,
        columnCount,
        layerCount,
        layerNeeded,
        layerLength,
        cargoLength,
      })
    }

    const totalLength = cargoResult.reduce((acc, cur) => {
      return acc + cur.cargoLength
    }, 0)

    truckResult.push({
      ...truck,
      cargo: cargoResult,
      totalLength,
    })
  }

  const freeLenght = truckResult.map(
    (truck) => truck.length - truck.totalLength,
  )

  const index = freeLenght.indexOf(
    Math.min(...freeLenght.filter((item) => item >= 0)),
  )
  const targetTruck = truckResult[index]

  if (targetTruck) {
    targetCargo.value = targetTruck.cargo
    await addLogRecord(
      `最佳装载方案为 ${targetTruck.name}，剩余空间 ${freeLenght[index]}mm`,
    )
    for await (const cargo of targetTruck.cargo) {
      await addLogRecord(
        `${cargo.name} ${cargo.placement === 'A' ? '顺向摆放' : '横向摆放'}，每排可放 ${cargo.layerCount} 箱，${cargo.total} 箱需要使用 ${cargo.layerNeeded} 排，使用长度 ${cargo.cargoLength}mm`,
      )
    }
  } else {
    await addLogRecord('没有找到合适的装载方案')
  }
}
</script>

<template>
  <ASpace class="w-full !items-start">
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
              v-model="cargo.total"
              :min="0"
              :max="100000"
              mode="button"
              placeholder="总箱数"
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
          <div class="flex items-center gap-2">
            <span class="arco-timeline-item-label">{{ log.time }}</span>
            <span class="arco-timeline-item-content">{{ log.content }}</span>
          </div>
        </ATimelineItem>
      </ATimeline>
    </AScrollbar>
  </ASpace>
</template>

<style scoped>
:deep(.arco-space-item:last-child) {
  flex-grow: 1;
}

:deep(.arco-space-item:last-child > .arco-scrollbar) {
  width: 100%;
}
</style>
