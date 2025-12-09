<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-3xl">F</span>
        </div>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Finerdy</h1>
        <p class="mt-2 text-sm text-gray-600">Gestión de finanzas personales</p>
      </div>

      <!-- Content -->
      <slot />
    </div>
  </div>
</template>
