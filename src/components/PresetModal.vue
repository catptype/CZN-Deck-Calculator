<template>
  <div @click.self="$emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
    
    <!-- Main Modal Container -->
    <div class="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg md:max-w-4xl h-[90vh] md:h-[80vh] p-4 flex flex-col">
      
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 class="text-2xl font-bold text-white">{{ t(`modal.title`) }}</h2>
        <button @click="$emit('close')" class="h-8 w-8 rounded-full bg-slate-700 hover:bg-red-500/50 text-slate-300 hover:text-white transition-colors flex items-center justify-center" aria-label="Close modal">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Search/Filter Input -->
      <div class="mb-4 flex-shrink-0">
        <input 
          type="text"
          v-model="searchQuery"
          :placeholder="t('modal.searchPlaceholder')"
          class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
      </div>

      <!-- Scrollable Preset Grid -->
      <!-- *** THE SCROLLBAR STYLE CLASS IS ADDED HERE *** -->
      <div class="overflow-y-auto flex-grow custom-scrollbar">
        <div v-if="filteredPresets.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <!-- *** THE PRESET ITEM IS REDESIGNED HERE *** -->
          <div 
            v-for="preset in filteredPresets" 
            :key="preset.id"
            @click="$emit('select', preset)"
            class="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all bg-slate-900 aspect-[2/1]"
          >
            <!-- The image now takes up the full space -->
            <img :src="`/presets/${preset.id}/banner.png`" :alt="preset.name" class="aspect-[2/1] object-cover w-full" />
            
            <!-- The text is now an overlay at the bottom -->
            <p class="absolute bottom-0 left-0 right-0 text-center font-semibold p-1 text-white bg-gradient-to-t from-black/80 to-transparent group-hover:text-cyan-400 transition-colors">
              {{ t(`presets.${preset.id}`) }}
            </p>
          </div>

        </div>
        <div v-else class="flex justify-center items-center h-full">
          <p class="text-slate-400">{{ t('modal.noResults') }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Preset } from '@/types/preset';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{ presets: Preset[] }>();

defineEmits(['select', 'close']);

const searchQuery = ref('');

const filteredPresets = computed(() => {
  // If the search query is empty, return all presets immediately.
  if (!searchQuery.value.trim()) {
    return props.presets;
  }

  const lowerCaseQuery = searchQuery.value.toLowerCase();

  // Filter the presets array by checking the TRANSLATED name.
  return props.presets.filter(preset => {
    // 1. Construct the translation key for the preset's name (e.g., 'presets.mika').
    const translationKey = `presets.${preset.id}`;
    
    // 2. Get the translated name using the t() function.
    const translatedName = t(translationKey);
    
    // 3. Perform the case-insensitive search on the translated name.
    return translatedName.toLowerCase().startsWith(lowerCaseQuery);
  });
});
</script>

<!-- *** THE SCROLLBAR STYLES ARE ADDED HERE *** -->
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569; /* slate-600 */
  border-radius: 20px;
  border: 2px solid #1e293b; /* slate-800 */
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #5f7089; /* A slightly lighter slate */
}
</style>