<script setup lang="ts">
import type { TransactionType } from '~/types'

const props = defineProps<{
  type: TransactionType
}>()

const { getTypeLabel, getTypeClasses } = useTransactionTypes()
const classes = computed(() => getTypeClasses(props.type))
</script>

<template>
  <span
    :class="[
      classes.bg,
      classes.text,
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    ]"
  >
    {{ getTypeLabel(type) }}
  </span>
</template>
