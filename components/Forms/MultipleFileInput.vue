<script setup lang="ts">
import { PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/vue/24/outline'

interface ExistingFile {
  id: number
  name: string
  url: string
  mime_type: string
}

interface FileData {
  id: number | string
  name: string
  url?: string
  type: string
  isExisting: boolean
  file?: File
}

const props = withDefaults(defineProps<{
  modelValue?: File[]
  label?: string
  error?: string
  errors?: Record<string, string[]>
  accept?: string
  existingFiles?: ExistingFile[]
}>(), {
  modelValue: () => [],
  label: '',
  error: '',
  errors: () => ({}),
  accept: 'image/*,application/pdf',
  existingFiles: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
  'removeExisting': [id: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const removedExistingIds = ref<number[]>([])

// Compute all attachment-related errors
const attachmentErrors = computed(() => {
  const errorMessages: string[] = []

  // Check for general attachments error
  if (typeof props.error === 'string' && props.error) {
    errorMessages.push(props.error)
  }

  // Check for individual file errors (attachments.0, attachments.1, etc.)
  if (props.errors) {
    Object.keys(props.errors).forEach((key) => {
      if (key.startsWith('attachments.')) {
        const errArray = props.errors[key]
        if (Array.isArray(errArray)) {
          errorMessages.push(...errArray)
        }
      }
    })
  }

  return errorMessages
})

const allFiles = computed<FileData[]>(() => {
  const files: FileData[] = []

  // Add existing files (excluding removed ones)
  props.existingFiles.forEach((file) => {
    if (!removedExistingIds.value.includes(file.id)) {
      files.push({
        id: file.id,
        name: file.name,
        url: file.url,
        type: file.mime_type,
        isExisting: true,
      })
    }
  })

  // Add new files
  props.modelValue.forEach((file, index) => {
    files.push({
      id: `new-${index}`,
      name: file.name,
      type: file.type,
      isExisting: false,
      file,
    })
  })

  return files
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  const newFiles = [...props.modelValue, ...files]
  emit('update:modelValue', newFiles)

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (fileData: FileData) => {
  if (fileData.isExisting) {
    removedExistingIds.value.push(fileData.id as number)
    emit('removeExisting', fileData.id as number)
  }
  else {
    const newFiles = props.modelValue.filter(f => f !== fileData.file)
    emit('update:modelValue', newFiles)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) {
    return PhotoIcon
  }
  return DocumentIcon
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="space-y-3">
      <!-- File List -->
      <div v-if="allFiles.length > 0" class="space-y-2">
        <div
          v-for="fileData in allFiles"
          :key="fileData.id"
          class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <component
            :is="getFileIcon(fileData.type)"
            class="h-5 w-5 text-gray-400 flex-shrink-0"
          />

          <div class="flex-1 min-w-0">
            <a
              v-if="fileData.isExisting && fileData.url"
              :href="fileData.url"
              target="_blank"
              class="text-sm text-primary-600 hover:text-primary-700 truncate block"
            >
              {{ fileData.name }}
            </a>
            <span v-else class="text-sm text-gray-700 truncate block">
              {{ fileData.name }}
            </span>
            <span v-if="!fileData.isExisting" class="text-xs text-gray-500">
              Nuevo archivo
            </span>
          </div>

          <button
            type="button"
            class="p-1.5 text-gray-400 hover:text-danger-600 transition-colors flex-shrink-0"
            :title="`Eliminar ${fileData.name}`"
            @click="removeFile(fileData)"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Add Files Button -->
      <div>
        <input
          ref="fileInput"
          type="file"
          :accept="accept"
          multiple
          class="hidden"
          @change="handleFileChange"
        >

        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          @click="triggerFileInput"
        >
          <PaperClipIcon class="h-4 w-4" />
          {{ allFiles.length > 0 ? 'Agregar más archivos' : 'Seleccionar archivos' }}
        </button>
      </div>
    </div>

    <div v-if="attachmentErrors.length > 0" class="space-y-1">
      <p v-for="(errMsg, index) in attachmentErrors" :key="index" class="text-sm text-danger-600">
        {{ errMsg }}
      </p>
    </div>

    <p v-if="attachmentErrors.length === 0 && allFiles.length === 0" class="text-xs text-gray-500">
      Formatos aceptados: imágenes y PDFs. Tamaño máximo: 10MB por archivo.
    </p>
  </div>
</template>
