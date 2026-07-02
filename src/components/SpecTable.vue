<script setup>
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  useTemplateRef,
  watch,
} from 'vue'
import Sortable from 'sortablejs'
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

const tableRef = useTemplateRef('table')
let sortable

const reorderRecords = (sortedIds) => {
  const list = [...database.value[props.prop]]
  const sortedRecords = sortedIds
    .map((id) => list.find((item) => item.id === id))
    .filter(Boolean)
  const sortedIdSet = new Set(sortedIds)
  const sortedPositions = list
    .map((item, index) => (sortedIdSet.has(item.id) ? index : -1))
    .filter((index) => index !== -1)

  if (sortedRecords.length !== sortedPositions.length) return

  sortedPositions.forEach((position, index) => {
    list[position] = sortedRecords[index]
  })
  database.value[props.prop] = list
}

const initSortable = async () => {
  await nextTick()

  const body = tableRef.value?.$el?.querySelector('.arco-table-tbody, tbody')
  if (!body) return

  sortable?.destroy()
  sortable = Sortable.create(body, {
    animation: 150,
    draggable: 'tr',
    handle: '.spec-drag-handle',
    ghostClass: 'sortable-ghost',
    onEnd(event) {
      const sortedIds = Array.from(
        event.to.querySelectorAll('.spec-drag-handle[data-sort-id]'),
      ).map((item) => item.dataset.sortId)

      reorderRecords(sortedIds)
    },
  })
}

onMounted(initSortable)
onBeforeUnmount(() => sortable?.destroy())

watch(
  () => database.value[props.prop].map((item) => item.id).join(','),
  initSortable,
  { flush: 'post' },
)

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
      <ATable ref="table" row-key="id" :data="database[props.prop]">
        <template #columns>
          <ATableColumn title="排序" align="center" :width="60">
            <template #cell="{ record }">
              <span
                class="spec-drag-handle inline-flex cursor-move items-center text-gray-400 hover:text-gray-700"
                :data-sort-id="record.id"
                title="拖拽排序"
              >
                <IconMenu />
              </span>
            </template>
          </ATableColumn>
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
          <ATableColumn title="操作" align="center" :width="96">
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
