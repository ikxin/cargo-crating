<script setup>
import { useStorage } from '@vueuse/core'
import { cargoDefaultData, truckDefaultData } from '../utils/default'
import { useTemplateRef } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  prop: String,
  name: String,
})

const database = useStorage('cargo-crating-database', {
  truck: [],
  cargo: [],
})

const fileInput = useTemplateRef('fileInput')

const resetDatabase = () => {
  database.value = {
    cargo: cargoDefaultData,
    truck: truckDefaultData,
  }
}

const exportData = () => {
  const dataStr = JSON.stringify(database.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `cargo-crating-backup-${new Date().toLocaleString().replace(/[/:]/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

const triggerImport = () => {
  fileInput.value?.click()
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      if (!Array.isArray(data?.truck) && !Array.isArray(data?.cargo))
        throw new Error()

      database.value = data
      Message.success('数据导入成功')
    } catch (error) {
      Message.error('文件解析失败，请确认文件格式正确')
    }
  }
  reader.readAsText(file)

  event.target.value = ''
}
</script>

<template>
  <ACard title="系统设置">
    <ASpace>
      <AButton type="primary" @click="exportData">导出数据</AButton>
      <AButton type="primary" @click="triggerImport">导入数据</AButton>
      <AButton type="primary" status="warning" @click="resetDatabase">
        恢复出厂数据
      </AButton>
    </ASpace>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="importData"
    />
  </ACard>
</template>
