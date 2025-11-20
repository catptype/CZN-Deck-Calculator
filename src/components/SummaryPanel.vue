<!-- src/components/SummaryPanel.vue -->
<template>
  <div v-if="deck" class="summary-panel bg-slate-900/70 backdrop-blur-sm p-4 rounded-xl shadow-lg">
    <div class="relative" :class="{ 'z-20': isBreakdownVisible }">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">{{ deck.name }}</h3>
        <button
          @click="$emit('reset')"
          :class="[actionBtnClasses, 'bg-orange-600/20 hover:bg-orange-500/30 text-orange-300 px-3']"
        >
          Reset
        </button>
      </div>
      <div class="flex justify-between items-center">
        <div class="cost-display text-lg font-mono">
          <strong class="font-semibold text-slate-200">Cost:</strong>
          <span
            :class="{
              'text-red-400': store.totalCost(deck) > store.maxCost,
              'text-green-400': store.totalCost(deck) <= store.maxCost,
            }"
            class="font-bold ml-2"
            >{{ store.totalCost(deck) }}</span
          >
          <span class="text-slate-400"> / {{ store.maxCost }}</span>
        </div>
        <div class="relative" @mouseenter="isBreakdownVisible = true" @mouseleave="isBreakdownVisible = false">
          <div class="cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div
            v-if="isBreakdownVisible"
            class="absolute top-full right-0 mt-2 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 p-3"
          >
            <h4 class="font-bold text-white text-base mb-2 border-b border-slate-600 pb-2">Cost Breakdown</h4>
            <div v-if="store.costBreakdown(deck).length > 0" class="flex flex-col gap-2 text-sm">
              <div v-for="(item, index) in store.costBreakdown(deck)" :key="index">
                <div class="flex justify-between items-center font-semibold">
                  <span class="text-white">{{ item.label }}</span>
                </div>
                <div
                  v-if="item.children && item.children.length > 0"
                  class="flex flex-col gap-1 pl-4 mt-1 border-l-2 border-slate-600"
                >
                  <div
                    v-for="(child, childIndex) in item.children"
                    :key="childIndex"
                    class="flex justify-between items-center"
                  >
                    <span class="text-slate-300">{{ child.label }}</span>
                    <span class="font-mono text-cyan-400">+{{ child.cost }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-slate-400 text-sm italic">No costs yet.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { type Deck, useMultiDeckStore } from '@/stores/multiDeck'

  defineProps<{ deck: Deck }>()
  const emit = defineEmits(['reset'])

  const store = useMultiDeckStore()
  const isBreakdownVisible = ref(false)

  const actionBtnClasses =
    'text-xs font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
</script>
