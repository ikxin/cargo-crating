<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const props = defineProps({
  truck: Object,
})

const MAX_PREVIEW_BOXES = 5000
const cargoColors = [
  '#e9a23b',
  '#2f9c95',
  '#d7655b',
  '#4f78bd',
  '#8a68a8',
  '#73a942',
  '#c87532',
  '#507c68',
]

const previewRef = useTemplateRef('preview')
const viewportRef = useTemplateRef('viewport')
const activeCargoIndex = ref(null)
const hoveredBox = ref(null)
const viewMode = ref('perspective')
const isFullscreen = ref(false)
const renderedBoxCount = ref(0)

let scene
let camera
let renderer
let controls
let previewGroup
let resizeObserver
let animationFrame
let raycaster
let pointer

const validCargo = computed(() =>
  (props.truck?.cargo || []).filter(
    (item) =>
      item.relativeLength > 0 &&
      item.relativeWidth > 0 &&
      item.relativeHeight > 0 &&
      item.rowBoxCount > 0 &&
      item.columnBoxCount > 0 &&
      item.mixedLayerCount > 0,
  ),
)

const getCargoBoxCount = (cargo) => {
  const capacity =
    cargo.mixedLayerCount * cargo.rowBoxCount * cargo.columnBoxCount
  return Math.max(0, Math.min(cargo.needBoxCount ?? capacity, capacity))
}

const totalBoxCount = computed(() =>
  validCargo.value.reduce((sum, item) => sum + getCargoBoxCount(item), 0),
)

const usedLength = computed(() =>
  validCargo.value.reduce(
    (sum, item) => sum + item.relativeLength * item.mixedLayerCount,
    0,
  ),
)

const utilization = computed(() => {
  if (!props.truck?.length) return 0
  return (usedLength.value / props.truck.length) * 100
})

const legendItems = computed(() =>
  validCargo.value.map((item, index) => ({
    ...item,
    index,
    color: cargoColors[index % cargoColors.length],
    boxCount: getCargoBoxCount(item),
  })),
)

const disposeObject = (object) => {
  object.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose())
    } else {
      child.material?.dispose()
    }
  })
}

const clearPreview = () => {
  if (!scene || !previewGroup) return
  scene.remove(previewGroup)
  disposeObject(previewGroup)
  previewGroup = null
}

const addTruckFrame = (scale) => {
  const length = props.truck.length * scale
  const width = props.truck.width * scale
  const height = props.truck.height * scale

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.035, width),
    new THREE.MeshStandardMaterial({
      color: '#d9dee3',
      roughness: 0.9,
      metalness: 0.05,
    }),
  )
  floor.position.y = -0.025
  floor.receiveShadow = true
  previewGroup.add(floor)

  const frameGeometry = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(length, height, width),
  )
  const frame = new THREE.LineSegments(
    frameGeometry,
    new THREE.LineBasicMaterial({ color: '#46515a' }),
  )
  frame.position.y = height / 2
  previewGroup.add(frame)

  const gridPoints = []
  const divisions = 12
  for (let index = 1; index < divisions; index += 1) {
    const x = -length / 2 + (length * index) / divisions
    gridPoints.push(x, 0, -width / 2, x, 0, width / 2)
  }
  for (let index = 1; index < 6; index += 1) {
    const z = -width / 2 + (width * index) / 6
    gridPoints.push(-length / 2, 0, z, length / 2, 0, z)
  }
  const gridGeometry = new THREE.BufferGeometry()
  gridGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(gridPoints, 3),
  )
  previewGroup.add(
    new THREE.LineSegments(
      gridGeometry,
      new THREE.LineBasicMaterial({
        color: '#aeb7bf',
        transparent: true,
        opacity: 0.55,
      }),
    ),
  )
}

const addOverflowMarker = (scale) => {
  if (usedLength.value <= props.truck.length) return

  const truckLength = props.truck.length * scale
  const height = props.truck.height * scale
  const width = props.truck.width * scale
  const points = [
    truckLength / 2,
    0,
    -width / 2,
    truckLength / 2,
    height,
    -width / 2,
    truckLength / 2,
    height,
    width / 2,
    truckLength / 2,
    0,
    width / 2,
  ]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  previewGroup.add(
    new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: '#dc2626', linewidth: 2 }),
    ),
  )
}

const buildPreview = () => {
  if (!scene) return
  clearPreview()
  hoveredBox.value = null
  renderedBoxCount.value = 0
  previewGroup = new THREE.Group()
  scene.add(previewGroup)

  if (!props.truck?.length || !props.truck?.width || !props.truck?.height) {
    return
  }

  const longestDimension = Math.max(
    props.truck.length,
    props.truck.width,
    props.truck.height,
    usedLength.value,
  )
  const scale = 12 / longestDimension
  addTruckFrame(scale)

  const allocationRatio = Math.min(1, MAX_PREVIEW_BOXES / totalBoxCount.value)
  let lengthOffset = 0

  validCargo.value.forEach((cargo, cargoIndex) => {
    const cargoBoxCount = getCargoBoxCount(cargo)
    const previewCount = Math.min(
      cargoBoxCount,
      Math.max(1, Math.floor(cargoBoxCount * allocationRatio)),
    )
    const geometry = new THREE.BoxGeometry(
      cargo.relativeLength * scale * 0.965,
      cargo.relativeHeight * scale * 0.965,
      cargo.relativeWidth * scale * 0.965,
    )
    const isMuted =
      activeCargoIndex.value !== null && activeCargoIndex.value !== cargoIndex
    const material = new THREE.MeshStandardMaterial({
      color: cargoColors[cargoIndex % cargoColors.length],
      roughness: 0.62,
      metalness: 0.02,
      transparent: isMuted,
      opacity: isMuted ? 0.12 : 1,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, previewCount)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.instances = []

    const matrix = new THREE.Matrix4()
    let instanceIndex = 0
    let actualIndex = 0
    const sampleStep = cargoBoxCount / previewCount

    outer: for (let layer = 0; layer < cargo.mixedLayerCount; layer += 1) {
      for (let column = 0; column < cargo.columnBoxCount; column += 1) {
        for (let row = 0; row < cargo.rowBoxCount; row += 1) {
          if (actualIndex >= cargoBoxCount) break outer

          const shouldRender =
            instanceIndex < previewCount &&
            actualIndex >= Math.floor(instanceIndex * sampleStep)
          if (shouldRender) {
            const x =
              (-props.truck.length / 2 +
                lengthOffset +
                (layer + 0.5) * cargo.relativeLength) *
              scale
            const y = (column + 0.5) * cargo.relativeHeight * scale
            const z =
              (-props.truck.width / 2 + (row + 0.5) * cargo.relativeWidth) *
              scale
            matrix.makeTranslation(x, y, z)
            mesh.setMatrixAt(instanceIndex, matrix)
            mesh.userData.instances.push({
              name: cargo.name || `货物 ${cargoIndex + 1}`,
              layer: layer + 1,
              row: row + 1,
              column: column + 1,
            })
            instanceIndex += 1
          }
          actualIndex += 1
        }
      }
    }

    mesh.count = instanceIndex
    mesh.instanceMatrix.needsUpdate = true
    previewGroup.add(mesh)
    renderedBoxCount.value += instanceIndex
    lengthOffset += cargo.relativeLength * cargo.mixedLayerCount
  })

  addOverflowMarker(scale)
}

const fitCamera = (mode = viewMode.value) => {
  if (!camera || !controls || !props.truck) return

  viewMode.value = mode
  const maxLength = Math.max(props.truck.length, usedLength.value)
  const longestDimension = Math.max(
    maxLength,
    props.truck.width,
    props.truck.height,
  )
  const scale = 12 / longestDimension
  const length = maxLength * scale
  const width = props.truck.width * scale
  const height = props.truck.height * scale
  const center = new THREE.Vector3(
    ((maxLength - props.truck.length) * scale) / 2,
    height * 0.42,
    0,
  )
  const radius = Math.sqrt(length ** 2 + width ** 2 + height ** 2) / 2
  const distance =
    (radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.3

  if (mode === 'top') {
    camera.position.copy(center).add(new THREE.Vector3(0, distance, 0.001))
    camera.up.set(0, 0, -1)
  } else if (mode === 'side') {
    camera.position.copy(center).add(new THREE.Vector3(0, 0, distance))
    camera.up.set(0, 1, 0)
  } else {
    camera.position
      .copy(center)
      .add(new THREE.Vector3(distance * 0.55, distance * 0.48, distance * 0.72))
    camera.up.set(0, 1, 0)
  }

  camera.near = Math.max(0.01, distance / 1000)
  camera.far = distance * 20
  camera.updateProjectionMatrix()
  controls.target.copy(center)
  controls.update()
}

const resizeRenderer = () => {
  if (!renderer || !camera || !viewportRef.value) return
  const { width, height } = viewportRef.value.getBoundingClientRect()
  if (!width || !height) return
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

const handlePointerMove = (event) => {
  if (!renderer || !camera || !raycaster || !pointer) return
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster
    .intersectObjects(previewGroup?.children || [], false)
    .find((item) => item.object.isInstancedMesh)

  if (!hit) {
    hoveredBox.value = null
    renderer.domElement.style.cursor = 'grab'
    return
  }

  hoveredBox.value = {
    ...hit.object.userData.instances[hit.instanceId],
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top + 12,
  }
  renderer.domElement.style.cursor = 'pointer'
}

const toggleCargo = (index) => {
  activeCargoIndex.value = activeCargoIndex.value === index ? null : index
}

const toggleFullscreen = async () => {
  if (!previewRef.value) return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await previewRef.value.requestFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === previewRef.value
  nextTick(resizeRenderer)
}

const initializeScene = () => {
  if (!viewportRef.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f3f5f6')
  scene.fog = new THREE.Fog('#f3f5f6', 22, 55)

  camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000)
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  viewportRef.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 2
  controls.maxDistance = 80

  scene.add(new THREE.HemisphereLight('#ffffff', '#77806f', 2.1))
  const keyLight = new THREE.DirectionalLight('#fff8e9', 2.8)
  keyLight.position.set(-8, 14, 10)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  scene.add(keyLight)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('pointerleave', () => {
    hoveredBox.value = null
  })

  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(viewportRef.value)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  const animate = () => {
    animationFrame = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  resizeRenderer()
  buildPreview()
  fitCamera()
}

watch(
  () => props.truck,
  async () => {
    await nextTick()
    buildPreview()
    fitCamera()
  },
  { deep: true },
)

watch(activeCargoIndex, buildPreview)

onMounted(initializeScene)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  controls?.dispose()
  clearPreview()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <section
    ref="preview"
    class="cargo-preview overflow-hidden border border-gray-200 bg-white"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-900">装箱预览</h3>
          <ATag v-if="truck" size="small" color="gray">{{ truck.name }}</ATag>
          <ATag v-if="utilization > 100" size="small" color="red"
            >超出货厢</ATag
          >
        </div>
        <p v-if="truck" class="mt-0.5 text-xs text-gray-500">
          {{ totalBoxCount.toLocaleString() }} 箱 · 占用
          {{ usedLength.toFixed(0) }}mm · 长度使用率
          {{ utilization.toFixed(1) }}%
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <ARadioGroup
          v-model="viewMode"
          type="button"
          size="small"
          @change="fitCamera"
        >
          <ARadio value="perspective">透视</ARadio>
          <ARadio value="top">俯视</ARadio>
          <ARadio value="side">侧视</ARadio>
        </ARadioGroup>
        <AButtonGroup size="small">
          <ATooltip content="复位视角">
            <AButton aria-label="复位视角" @click="fitCamera()"
              ><IconRefresh
            /></AButton>
          </ATooltip>
          <ATooltip :content="isFullscreen ? '退出全屏' : '全屏预览'">
            <AButton aria-label="切换全屏" @click="toggleFullscreen">
              <IconFullscreenExit v-if="isFullscreen" />
              <IconFullscreen v-else />
            </AButton>
          </ATooltip>
        </AButtonGroup>
      </div>
    </header>

    <div ref="viewport" class="preview-viewport relative">
      <div
        v-if="!truck"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <AEmpty description="选择货车后显示装箱预览" />
      </div>
      <div
        v-else-if="hoveredBox"
        class="pointer-events-none absolute z-10 border border-gray-200 bg-white/95 px-2.5 py-2 text-xs shadow-lg"
        :style="{ left: `${hoveredBox.x}px`, top: `${hoveredBox.y}px` }"
      >
        <div class="font-medium text-gray-900">{{ hoveredBox.name }}</div>
        <div class="mt-0.5 text-gray-500">
          第 {{ hoveredBox.layer }} 排 · 横向 {{ hoveredBox.row }} · 纵向
          {{ hoveredBox.column }}
        </div>
      </div>
    </div>

    <footer
      v-if="truck"
      class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-3 py-2"
    >
      <div class="flex min-w-0 flex-wrap items-center gap-1.5">
        <button
          type="button"
          class="legend-button"
          :class="{ active: activeCargoIndex === null }"
          @click="activeCargoIndex = null"
        >
          全部货物
        </button>
        <button
          v-for="item in legendItems"
          :key="item.id || item.index"
          type="button"
          class="legend-button"
          :class="{ active: activeCargoIndex === item.index }"
          @click="toggleCargo(item.index)"
        >
          <span
            class="h-2.5 w-2.5 shrink-0"
            :style="{ backgroundColor: item.color }"
          ></span>
          <span class="max-w-36 truncate">{{
            item.name || `货物 ${item.index + 1}`
          }}</span>
          <span class="text-gray-400">{{ item.boxCount }}</span>
        </button>
      </div>
      <span
        v-if="renderedBoxCount < totalBoxCount"
        class="text-xs text-gray-400"
      >
        性能模式：显示 {{ renderedBoxCount.toLocaleString() }} /
        {{ totalBoxCount.toLocaleString() }} 箱
      </span>
    </footer>
  </section>
</template>

<style scoped>
.cargo-preview {
  border-radius: 6px;
}

.preview-viewport {
  height: clamp(320px, 42vw, 540px);
  min-height: 320px;
}

.preview-viewport :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.legend-button {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  padding: 0 8px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.legend-button:hover,
.legend-button.active {
  border-color: #9ca3af;
  background: #f3f4f6;
  color: #111827;
}

.cargo-preview:fullscreen {
  display: flex;
  height: 100vh;
  flex-direction: column;
  border: 0;
  border-radius: 0;
}

.cargo-preview:fullscreen .preview-viewport {
  height: auto;
  min-height: 0;
  flex: 1;
}

@media (max-width: 640px) {
  .preview-viewport {
    height: 360px;
    min-height: 360px;
  }
}
</style>
