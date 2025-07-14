<script setup>
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

const database = useStorage('cargo-crating-database', {
  cargo: [],
})

const cargoData = ref([
  {
    id: crypto.randomUUID(),
  },
])

const logData = ref([
  {
    time: new Date().toLocaleString(),
    content: '初始化货物数据',
  },
])
</script>

<template>
  <ASpace class="!items-start">
    <template #split>
      <ADivider direction="vertical" class="text-6xl" />
    </template>

    <div class="flex flex-col gap-2">
      <AButton type="primary" @click="cargoData.push({})">添加货物</AButton>
      <AButton>开始计算</AButton>
    </div>

    <div class="flex flex-col gap-2">
      <template v-for="(cargo, index) in cargoData" :key="cargo.id">
        <ASpace>
          <span>货物类型：</span>
          <ASelect
            v-model="cargo.cargoId"
            allow-clear
            allow-search
            placeholder="选择货物"
            class="!w-36"
          >
            <template v-for="item in database.cargo" :key="item.id">
              <AOption :value="item.id" :label="item.name" />
            </template>
          </ASelect>
          <span>混装箱数：</span>
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

    <ATimeline>
      <ATimelineItem
        v-for="(log, index) in logData"
        :key="index"
        :label="log.time"
      >
        {{ log.content }}
      </ATimelineItem>
    </ATimeline>
  </ASpace>
</template>
