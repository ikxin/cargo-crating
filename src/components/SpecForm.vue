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

const handleClose = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <AModal
    :title="edit ? '编辑规格' : '添加规格'"
    :width="320"
    @before-ok="handleSubmit"
    @close="handleClose"
  >
    <AForm ref="form" :model="data" auto-label-width>
      <AFormItem label="名称" field="name" :rules="{ required: true }">
        <AInput v-model="data.name" />
      </AFormItem>
      <AFormItem label="长度" field="length" :rules="{ required: true }">
        <AInputNumber
          v-model="data.length"
          :min="0"
          :max="100000"
          :precision="0"
        >
          <template #append>
            <span class="w-6 text-center">mm</span>
          </template>
        </AInputNumber>
      </AFormItem>
      <AFormItem label="宽度" field="width" :rules="{ required: true }">
        <AInputNumber
          v-model="data.width"
          :min="0"
          :max="100000"
          :precision="0"
        >
          <template #append>
            <span class="w-6 text-center">mm</span>
          </template>
        </AInputNumber>
      </AFormItem>
      <AFormItem label="高度" field="height" :rules="{ required: true }">
        <AInputNumber
          v-model="data.height"
          :min="0"
          :max="100000"
          :precision="0"
        >
          <template #append>
            <span class="w-6 text-center">mm</span>
          </template>
        </AInputNumber>
      </AFormItem>
      <template v-if="prop === 'cargo'">
        <AFormItem label="净重" field="netWeight" :rules="{ required: true }">
          <AInputNumber
            v-model="data.netWeight"
            :min="0"
            :max="100000"
            :step="0.1"
            :precision="1"
          >
            <template #append>
              <span class="w-6 text-center">kg</span>
            </template>
          </AInputNumber>
        </AFormItem>
        <AFormItem label="毛重" field="grossWeight" :rules="{ required: true }">
          <AInputNumber
            v-model="data.grossWeight"
            :min="0"
            :max="100000"
            :step="0.1"
            :precision="1"
          >
            <template #append>
              <span class="w-6 text-center">kg</span>
            </template>
          </AInputNumber>
        </AFormItem>
      </template>
    </AForm>
  </AModal>
</template>
