<template>
  <div v-if="deck" class="summary-panel bg-slate-900/70 backdrop-blur-sm p-4 rounded-xl shadow-lg">
    
    <div @click="isModalOpen = true" class="relative cursor-pointer rounded-lg overflow-hidden mb-4 border-2 border-slate-700 hover:border-cyan-500 transition-all">
      <div v-if="deck.artworkPresetId === 'default'" class="w-full aspect-[3/1] flex justify-center items-center">
        <span class="text-slate-400 font-semibold">Select Character</span>
      </div>
      <img v-else :src="bannerImage" :alt="deck.name" class="w-full aspect-[3/1] object-cover" />

      <div 
        class="absolute bottom-0 left-0 h-1 transition-all duration-300"
        :class="costIndicatorStyle.color"
        :style="{ width: costIndicatorStyle.width }">
      </div>
    </div>
    
    <div class="relative" :class="{ 'z-20': isBreakdownVisible }">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">{{ deck.name }}</h3>
        <button
          @click="$emit('reset')"
          :class="btnClasses"
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
            class="absolute top-full -right-5 mt-2 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 p-3"
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

    <!-- The Modal -->
    <Teleport to="body">
      <PresetModal 
        v-if="isModalOpen" 
        :presets="presets"
        @close="isModalOpen = false"
        @select="handlePresetSelect"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { type Deck, useMultiDeckStore } from '@/stores/multiDeck'
  import { usePresets } from '@/services/usePresets';
  import type { Preset } from '@/types/preset';
  import PresetModal from '@/components/PresetModal.vue';

  const props = defineProps<{ deck: Deck }>();

  const store = useMultiDeckStore();
  const { presets, isLoading } = usePresets(); // Use our new composable

  const isModalOpen = ref(false);
  const isBreakdownVisible = ref(false);

  const bannerImage = computed(() => {
    const isOverCost = store.totalCost(props.deck) > store.maxCost;
    const imageName = isOverCost ? 'banner_overcost.png' : 'banner.png';
    return `/presets/${props.deck.artworkPresetId}/${imageName}`;
  });

  const costIndicatorStyle = computed(() => {
    const total = store.totalCost(props.deck);
    const max = store.maxCost;

    // Calculate percentage, but cap it at 100% for the visual width
    const percentage = Math.min((total / max) * 100, 100);

    return {
      width: `${percentage}%`,
      // Use Tailwind classes for the color
      color: total > max ? 'bg-red-500' : 'bg-green-500'
    };
  });

  const handlePresetSelect = (preset: Preset) => {
    store.applyArtworkPreset(props.deck.id, preset);
    isModalOpen.value = false;
  };

  const btnClasses = `
    px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg 
    font-semibold text-white shadow-md 
    transform transition-transform 
  `;
</script>
