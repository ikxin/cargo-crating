<script setup>
import { toRefs, useTemplateRef } from 'vue'
import { useStorage } from '@vueuse/core'

const props = defineProps({
  data: Object,
  edit: Boolean,
  prop: String,
})

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const { data, edit } = toRefs(props)

const formRef = useTemplateRef('form')

const handleSubmit = (done) => {
  formRef.value.validate((valid) => {
    if (valid) {
      done(false)
      return
    }

    if (edit.value) {
      const index = database.value[props.prop].findIndex(
        (item) => item.id === data.value.id,
      )
      if (index !== -1) {
        database.value[props.prop][index] = {
          ...database.value[props.prop][index],
          ...data.value,
        }
        done(true)
      }
    } else {
      database.value[props.prop].push({
        id: crypto.randomUUID(),
        ...data.value,
      })
      done(true)
    }
  })
}
</script>

<template>
  <AModal :title="edit ? '编辑规格' : '添加规格'" @before-ok="handleSubmit">
    <AForm ref="form" :model="data">
      <AFormItem
        label="名称"
        field="name"
        :rules="{ required: true, message: 'name is required' }"
      >
        <AInput v-model="data.name" />
      </AFormItem>
      <AFormItem label="长度" field="length">
        <AInput v-model="data.length" />
      </AFormItem>
      <AFormItem label="宽度" field="width">
        <AInput v-model="data.width" />
      </AFormItem>
      <AFormItem label="高度" field="height">
        <AInput v-model="data.height" />
      </AFormItem>
    </AForm>
  </AModal>
</template>
