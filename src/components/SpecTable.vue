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
      <AButton type="primary" @click="createRecord">添加</AButton>
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
          <ATableColumn
            title="名称"
            dataIndex="name"
            align="center"
          ></ATableColumn>
          <ATableColumn
            title="长度"
            dataIndex="length"
            align="center"
          ></ATableColumn>
          <ATableColumn
            title="宽度"
            dataIndex="width"
            align="center"
          ></ATableColumn>
          <ATableColumn
            title="高度"
            dataIndex="height"
            align="center"
          ></ATableColumn>
          <template v-if="props.prop === 'cargo'">
            <ATableColumn
              title="净重"
              dataIndex="netWeight"
              align="center"
            ></ATableColumn>
            <ATableColumn
              title="毛重"
              dataIndex="grossWeight"
              align="center"
            ></ATableColumn>
          </template>
          <ATableColumn title="操作" align="center">
            <template #cell="{ record }">
              <ASpace>
                <AButton
                  status="warning"
                  type="outline"
                  @click="updateRecord(record)"
                >
                  编辑
                </AButton>
                <AButton
                  status="danger"
                  type="outline"
                  @click="deleteRecord(record)"
                >
                  删除
                </AButton>
              </ASpace>
            </template>
          </ATableColumn>
        </template>
      </ATable>
    </template>
  </ACard>
</template>
