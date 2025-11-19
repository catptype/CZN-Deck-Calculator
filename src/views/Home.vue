<template>
  <div class="p-4 bg-slate-900 min-h-screen text-slate-300">
    <div class="max-w-[850px] mx-auto">

      <!-- Global Header -->
      <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="bg-slate-800/50 p-4 rounded-xl shadow-lg flex flex-col justify-between items-center gap-4 border border-slate-700">
          <h1 class="text-3xl font-bold text-white">Chaos Zero Nightmare Save Data</h1>
          
          <div class="flex items-center gap-4">
            <!-- Shared Tier Control -->
            <div class="tier-control flex items-center gap-3">
              <label for="deck-tier" class="font-semibold text-slate-200 whitespace-nowrap">Chaos Tier:</label>
              <input 
                type="number" 
                id="deck-tier" 
                :value="store.sharedDeckTier" 
                @input="updateTier($event)" 
                min="1" 
                class="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 w-20 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            
            <!-- Global Reset Button -->
            <button @click="confirmAndResetAll" :class="[btnClasses, 'bg-orange-600 hover:bg-orange-500 focus:ring-orange-400']">
              Reset All
            </button>
          </div>
        </div>
      </div>

      <!-- Grid for the three deck components -->
      <div class="max-w-screen-2xl mx-auto grid grid-cols-1 gap-6">
        <DeckComponent 
          v-for="deck in store.decks" 
          :key="deck.id" 
          :deck-id="deck.id" 
        />
      </div>

    </div>
    
  </div>
</template>

<script setup lang="ts">
import { useMultiDeckStore } from '@/stores/multiDeck';
import DeckComponent from '@/components/DeckComponent.vue';

const store = useMultiDeckStore();

const updateTier = (event: Event) => {
  const target = event.target as HTMLInputElement;
  store.setSharedDeckTier(Number(target.value));
};

const confirmAndResetAll = () => {
  if (window.confirm('Are you sure you want to reset ALL decks? This cannot be undone.')) {
    store.resetAllDecks();
  }
};

// This is needed for the global "Reset All" button's styling
const btnClasses = 'w-auto px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800';
</script>