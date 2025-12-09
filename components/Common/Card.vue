<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  padding?: boolean
}>(), {
  padding: true,
})
</script>

<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div v-if="title" class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        {{ title }}
      </h3>
    </div>
    <div :class="padding ? 'px-4 py-5 sm:p-6' : ''">
      <slot />
    </div>
  </div>
</template>
