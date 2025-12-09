<script setup lang="ts">
import { DocumentChartBarIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        Reportes
      </h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Balance Sheet Card -->
      <NuxtLink
        to="/reports/balance-sheet"
        class="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <BanknotesIcon class="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Estado Patrimonial
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Balance de todas tus cuentas a una fecha determinada, con conversión a moneda de referencia.
            </p>
          </div>
        </div>
      </NuxtLink>

      <!-- Income Statement Card -->
      <NuxtLink
        to="/reports/income-statement"
        class="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <DocumentChartBarIcon class="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Estado de Resultados
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Ingresos y gastos por categoría en un período, con resultado neto.
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
