<script setup>
import { reactive } from 'vue'
import { useStorage } from '@vueuse/core'
import SpecForm from './SpecForm.vue'

const props = defineProps({
  prop: String,
  name: String,
})

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const form = reactive({
  open: false,
  edit: false,
  data: {},
})

const createRecord = () => {
  form.data = {}
  form.edit = false
  form.open = true
}

const updateRecord = (record) => {
  form.data = { ...record }
  form.edit = true
  form.open = true
}

const deleteRecord = (record) => {
  const index = database.value[props.prop].findIndex(
    (item) => item.id === record.id,
  )
  if (index !== -1) {
    database.value[props.prop].splice(index, 1)
  }
}
</script>

<template>
  <ACard :title="`${props.name}规格`">
    <template #extra>
      <AButton type="primary" @click="createRecord">
        <template #icon>
          <IconPlus />
        </template>
        <template #default>添加</template>
      </AButton>
      <SpecForm
        v-model:visible="form.open"
        :data="form.data"
        :edit="form.edit"
        :prop="props.prop"
      ></SpecForm>
    </template>
    <template #default>
      <ATable :data="database[props.prop]">
        <template #columns>
          <ATableColumn title="名称" dataIndex="name" align="center">
            <template #cell="{ record }">
              {{ record.name }}
            </template>
          </ATableColumn>
          <ATableColumn title="长度" dataIndex="length" align="center">
            <template #cell="{ record }"> {{ record.length }}mm </template>
          </ATableColumn>
          <ATableColumn title="宽度" dataIndex="width" align="center">
            <template #cell="{ record }"> {{ record.width }}mm </template>
          </ATableColumn>
          <ATableColumn title="高度" dataIndex="height" align="center">
            <template #cell="{ record }"> {{ record.height }}mm </template>
          </ATableColumn>
          <template v-if="props.prop === 'cargo'">
            <ATableColumn title="净重" dataIndex="netWeight" align="center">
              <template #cell="{ record }">
                {{ record.netWeight.toFixed(1) }}kg
              </template>
            </ATableColumn>
            <ATableColumn title="毛重" dataIndex="grossWeight" align="center">
              <template #cell="{ record }">
                {{ record.grossWeight.toFixed(1) }}kg
              </template>
            </ATableColumn>
          </template>
          <ATableColumn title="操作" align="center">
            <template #cell="{ record }">
              <ASpace>
                <AButton status="warning" @click="updateRecord(record)">
                  <template #icon>
                    <IconEdit />
                  </template>
                </AButton>
                <AButton status="danger" @click="deleteRecord(record)">
                  <template #icon>
                    <IconDelete />
                  </template>
                </AButton>
              </ASpace>
            </template>
          </ATableColumn>
        </template>
      </ATable>
    </template>
  </ACard>
</template>
