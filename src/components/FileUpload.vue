<script setup>
import { ref, computed, reactive } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'
import CircularProgress from './CircularProgress.vue'

const props = defineProps({
  multiple: Boolean,
  accept: String,
  maxSize: Number, // in bytes
  maxFiles: Number, // maximum number of files
  variant: {
    type: String,
    default: 'dashed',
    validator: (value) => ['default', 'dashed'].includes(value)
  }
})

const emit = defineEmits(['files-selected', 'file-removed'])

const files = ref([])
const isDragOver = ref(false)
const fileInput = ref(null)
const uploadingFiles = ref([])

const dropzoneVariants = cva(
  'border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out shadow-sm',
  {
    variants: {
      variant: {
        default: 'ui-border-strong  hover:border-(--ui-border-strong) hover:bg-(--ui-surface) focus-within:ring-2 focus-within:ring-(--ui-primary)',
        dashed: 'border-(--ui-primary-soft) hover:border-(--ui-primary-soft) hover:bg-(--ui-primary-soft) focus-within:ring-2 focus-within:ring-(--ui-primary)'
      }
    }
  }
)

const dropzoneClasses = computed(() =>
  cn(
    dropzoneVariants({ variant: props.variant }),
    {
      'border-(--ui-success) ui-success-soft shadow-md': files.value.length > 0 && !isDragOver.value,
      'border-(--ui-primary) ui-primary-soft ring-4 ring-(--ui-primary) shadow-lg': isDragOver.value,
      'border-(--ui-success) ui-success-soft ring-4 ring-(--ui-success) shadow-lg': files.value.length > 0 && isDragOver.value
    }
  )
)

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const droppedFiles = Array.from(event.dataTransfer.files)
  addFiles(droppedFiles)
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragEnter = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

const addFiles = (newFiles) => {
  const validFiles = newFiles.filter(file => {
    if (props.maxSize && file.size > props.maxSize) {
      return false
    }
    return true
  })

  if (validFiles.length === 0) return

  // Check maxFiles limit
  if (props.maxFiles) {
    const currentCount = files.value.length + uploadingFiles.value.length
    if (currentCount >= props.maxFiles) {
      return // Don't add more files
    }
    const remaining = props.maxFiles - currentCount
    validFiles.splice(remaining) // Limit to remaining slots
  }

  // Add files to uploading state with progress
  const filesWithProgress = validFiles.map(file => reactive({
    file,
    progress: 0,
    uploading: true
  }))

  uploadingFiles.value.push(...filesWithProgress)

  // Simulate upload progress with smooth increments
  filesWithProgress.forEach((fileItem) => {
    const duration = 2000 + Math.random() * 2000 // 2-4 seconds total
    const intervalTime = 50 // Update every 50ms
    const totalSteps = duration / intervalTime
    const increment = 100 / totalSteps

    const interval = setInterval(() => {
      fileItem.progress += increment

      if (fileItem.progress >= 100) {
        fileItem.progress = 100
        fileItem.uploading = false
        clearInterval(interval)

        // Keep the green success state visible briefly
        setTimeout(() => {
          if (props.multiple) {
            files.value.push(fileItem.file)
            emit('files-selected', files.value)
          } else {
            files.value = [fileItem.file]
            emit('files-selected', fileItem.file)
          }

          uploadingFiles.value.splice(uploadingFiles.value.indexOf(fileItem), 1)
        }, 450)
      }
    }, intervalTime)
  })
}

const removeFile = (index) => {
  files.value.splice(index, 1)
  if (props.multiple) {
    emit('file-removed', files.value)
  } else {
    emit('file-removed', files.value.length > 0 ? files.value[0] : null)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getUploadTone = (progress) => {
  if (progress < 40) {
    return {
      row: 'border-red-500 bg-red-50',
      text: 'text-red-700'
    }
  }
  if (progress < 80) {
    return {
      row: 'border-orange-500 bg-orange-50',
      text: 'text-orange-700'
    }
  }
  return {
    row: 'border-green-500 bg-green-50',
    text: 'text-green-700'
  }
}

</script>

<template>
  <div class="ui-surface-strong w-full">
    <div
      v-if="!files.length || multiple"
      :class="dropzoneClasses"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      >
      
      <div class="ui-surface-strong flex items-center justify-center px-4 py-3">
        <div class=" rounded-full p-2 mr-3">
          <Icon
            icon="upload"
            class="h-6 w-6 ui-text"
          />
        </div>
        <div class="flex flex-col">
          <p class="text-sm font-medium ui-text">
            <span class="ui-primary font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs ui-text">
            {{ maxSize ? `Up to ${formatFileSize(maxSize)}` : 'No size limit' }}
            <span
              v-if="accept"
              class="ml-2"
            >• {{ accept }}</span>
          </p>
        </div>
      </div>
    </div>
    
    <div
      v-if="files.length > 0 || uploadingFiles.length > 0"
      class="mt-4 space-y-2"
    >
      <!-- Uploading files -->
      <div
        v-for="(fileItem, index) in uploadingFiles"
        :key="`uploading-${index}`"
        :class="[
          'flex items-center justify-between p-3 border rounded-lg shadow-sm transition-colors duration-300',
          getUploadTone(fileItem.progress).row
        ]"
      >
        <div class="flex items-center space-x-3">
          <CircularProgress
            :value="fileItem.progress"
            :max="100"
            size="sm"
            :dynamic-color="true"
            class="shrink-0"
          />
          <div class="flex flex-col">
            <span class="text-sm font-medium ui-text">{{ fileItem.file.name }}</span>
            <span :class="['text-xs font-medium', getUploadTone(fileItem.progress).text]">
              Uploading... {{ Math.round(fileItem.progress) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Uploaded files -->
      <div
        v-for="(file, index) in files"
        :key="`uploaded-${index}`"
        class="flex items-center justify-between p-3 ui-surface  border ui-border-strong  rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center space-x-3">
          <div class="ui-success-soft rounded-md p-2">
            <Icon
              icon="file"
              class="h-5 w-5 ui-text"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium ui-text">{{ file.name }}</span>
            <span class="text-xs ui-text">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
        <button
          class="ui-text hover:text-(--ui-danger) hover:bg-(--ui-danger-soft) rounded-full p-1 transition-colors"
          @click="removeFile(index)"
        >
          <Icon
            icon="x"
            class="h-4 w-4"
          />
        </button>
      </div>
    </div>
  </div>
</template>
