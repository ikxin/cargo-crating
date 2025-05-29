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
    header: '长度',
    accessorKey: 'length',
    cell: ({ row }) => {
      return `${row.getValue('length')}mm`
    },
  },
  {
    header: '宽度',
    accessorKey: 'width',
    cell: ({ row }) => {
      return `${row.getValue('width')}mm`
    },
  },
  {
    header: '高度',
    accessorKey: 'height',
    cell: ({ row }) => {
      return `${row.getValue('height')}mm`
    },
  },
  {
    header: '毛重',
    accessorKey: 'gw',
    cell: ({ row }) => {
      return `${row.getValue('gw') || 0}kg`
    },
  },
  {
    header: '净重',
    accessorKey: 'nw',
    cell: ({ row }) => {
      return `${row.getValue('nw') || 0}kg`
    },
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
          onClick: () => deleteItem(row.original.id),
        }),
      ])
    },
  },
]

const columnVisibility = computed(() => {
  return props.prop === 'cargo' ? undefined : { gw: false, nw: false }
})

const schema = z.object({
  id: z.string().default(() => nanoid()),
  name: z.string().min(1, '请输入名称').default('默认名称'),
  length: z.number().int().nonnegative('长度必须为非负数').default(0),
  width: z.number().int().nonnegative('宽度必须为非负数').default(0),
  height: z.number().int().nonnegative('高度必须为非负数').default(0),
  nw: z.number().int().nonnegative('净重必须为非负数').default(0),
  gw: z.number().int().nonnegative('毛重必须为非负数').default(0),
})

const defaultValues = schema.parse({})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({ ...defaultValues })

const formAttr = reactive({
  open: false,
  edit: false,
})

const openAddForm = () => {
  resetForm()
  formAttr.open = true
}

const resetForm = () => {
  formAttr.edit = false
  Object.assign(state, {
    ...defaultValues,
    id: nanoid(),
  })
}

const deleteItem = (id: string) => {
  if (confirm(`确定要删除此${props.name}规格吗？`)) {
    const index = data.value.findIndex((item) => item.id === id)
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
    const index = data.value.findIndex((item) => item.id === state.id)
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
  <UCard class="w-full overflow-hidden">
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
    <UTable
      v-model:column-visibility="columnVisibility"
      :data="data"
      :columns="columns"
    ></UTable>
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
        <UFormField label="名称" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="长度 (mm)" name="length">
          <UInputNumber v-model="state.length" class="w-full" />
        </UFormField>
        <UFormField label="宽度 (mm)" name="width">
          <UInputNumber v-model="state.width" class="w-full" />
        </UFormField>
        <UFormField label="高度 (mm)" name="height">
          <UInputNumber v-model="state.height" class="w-full" />
        </UFormField>
        <template v-if="props.prop === 'cargo'">
          <UFormField label="净重 (kg)" name="nw">
            <UInputNumber v-model="state.nw" class="w-full" />
          </UFormField>
          <UFormField label="毛重 (kg)" name="gw">
            <UInputNumber v-model="state.gw" class="w-full" />
          </UFormField>
        </template>
        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="formAttr.open = false">取消</UButton>
          <UButton type="submit">提交</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
