<template>
  <div @click.self="$emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
    <div class="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[80vh] p-4 flex flex-col">
      <h2 class="text-2xl font-bold text-white mb-4">Select a Character</h2>
      <div class="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div 
          v-for="preset in presets" 
          :key="preset.id"
          @click="$emit('select', preset)"
          class="cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all"
        >
          <img :src="`/presets/${preset.id}/banner.png`" :alt="preset.name" class="aspect-[3/1] object-cover w-full" />
          <p class="text-center font-semibold bg-slate-900 p-2 text-white">{{ preset.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Preset } from '@/types/preset';
defineProps<{ presets: Preset[] }>();
defineEmits(['select', 'close']);
</script>