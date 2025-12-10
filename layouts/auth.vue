<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() =>
  locales.value.filter((l): l is { code: string; name: string } =>
    typeof l === 'object' && 'code' in l && 'name' in l,
  ),
)

const switchLocale = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLocale(target.value)
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-gray-100 pt-6 antialiased sm:justify-center sm:pt-0">
    <!-- Language Switcher -->
    <div class="absolute right-4 top-4">
      <select
        :value="locale"
        class="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        @change="switchLocale"
      >
        <option v-for="loc in availableLocales" :key="loc.code" :value="loc.code">
          {{ loc.name }}
        </option>
      </select>
    </div>

    <!-- Logo -->
    <div class="text-center">
      <NuxtLink to="/" class="inline-block">
        <CommonApplicationLogo class="h-40 w-auto" />
      </NuxtLink>
    </div>

    <!-- Content -->
    <div class="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
      <slot />
    </div>
  </div>
</template>
