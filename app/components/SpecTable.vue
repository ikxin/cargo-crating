<script lang="ts" setup>
import * as z from 'zod'
import { useStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import type { TableColumn, FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  prop: string
  name: string
  default: SpecsType[]
}>()

const toast = useToast()

const UButton = resolveComponent('UButton')

const data = useStorage(`${props.prop}-data`, props.default)

const columns: TableColumn<SpecsType>[] = [
  {
    header: `${props.name}名称`,
    accessorKey: 'name',
  },
  {
    header: '长度 (mm)',
    accessorKey: 'length',
  },
  {
    header: '宽度 (mm)',
    accessorKey: 'width',
  },
  {
    header: '高度 (mm)',
    accessorKey: 'height',
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2 w-fit m-auto' }, [
        h(UButton, {
          color: 'neutral',
          icon: 'lucide:square-pen',
          variant: 'ghost',
          onClick: () => {
            Object.assign(state, row.original)
            formAttr.edit = true
            formAttr.open = true
          },
        }),
        h(UButton, {
          icon: 'lucide:trash-2',
          color: 'error',
          variant: 'ghost',
          onClick: () => deleteItem(row.original.uuid),
        }),
      ])
    },
  },
]

const schema = z.object({
  uuid: z.string(),
  name: z.string().min(1, '请输入名称'),
  length: z.number().int().positive('长度必须为正数'),
  width: z.number().int().positive('宽度必须为正数'),
  height: z.number().int().positive('高度必须为正数'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  uuid: nanoid(),
  name: '',
  length: 0,
  width: 0,
  height: 0,
})

const formAttr = reactive({
  open: false,
  edit: false,
})

const openAddForm = () => {
  resetForm()
  formAttr.open = true
}

const resetForm = () => {
  state.uuid = nanoid()
  state.name = ''
  state.length = 0
  state.width = 0
  state.height = 0
  formAttr.edit = false
}

const deleteItem = (uuid: string) => {
  if (confirm(`确定要删除此${props.name}规格吗？`)) {
    const index = data.value.findIndex((item) => item.uuid === uuid)
    if (index !== -1) {
      data.value.splice(index, 1)
      toast.add({
        title: '删除成功',
        color: 'success',
      })
    }
  }
}

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  if (formAttr.edit) {
    const index = data.value.findIndex((item) => item.uuid === state.uuid)
    if (index !== -1) {
      data.value[index] = { ...event.data }
      toast.add({
        title: '更新成功',
        color: 'success',
      })
    }
  } else {
    data.value.push({ ...event.data })
    toast.add({
      title: '添加成功',
      color: 'success',
    })
  }

  formAttr.open = false
  resetForm()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            :name="prop === 'truck' ? 'lucide:truck' : 'lucide:box'"
            class="text-2xl text-primary"
          />
          <span class="text-xl font-semibold text-neutral">
            {{ props.name }}规格
          </span>
        </div>
        <div class="flex items-center gap-2">
          <UButton @click="openAddForm">
            <UIcon name="lucide:plus" />
            <span>添加{{ props.name }}</span>
          </UButton>
        </div>
      </div>
    </template>
    <UTable :data="data" :columns="columns"></UTable>
  </UCard>
  <UModal
    v-model:open="formAttr.open"
    :title="`${formAttr.edit ? '编辑' : '添加'}${props.name}规格`"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="名称" name="name" size="xl">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="长度 (mm)" name="length" size="xl">
          <UInputNumber v-model="state.length" class="w-full" />
        </UFormField>
        <UFormField label="宽度 (mm)" name="width" size="xl">
          <UInputNumber v-model="state.width" class="w-full" />
        </UFormField>
        <UFormField label="高度 (mm)" name="height" size="xl">
          <UInputNumber v-model="state.height" class="w-full" />
        </UFormField>
        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="formAttr.open = false">取消</UButton>
          <UButton type="submit" size="xl">提交</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
