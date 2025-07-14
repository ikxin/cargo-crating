<script setup>
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

const database = useStorage('cargo-crating-database', {
  cargo: [],
})

const cargoData = ref([])
</script>

<template>
  <div class="flex flex-col gap-4">
    <ASpace>
      <AButton type="primary" @click="cargoData.push({})">添加货物</AButton>
      <AButton>开始计算</AButton>
    </ASpace>

    <template v-for="(cargo, index) in cargoData" :key="index">
      <ASpace>
        <ASelect
          v-model="cargo.id"
          allow-clear
          allow-search
          placeholder="选择货物"
          class="!w-36"
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
</template>
