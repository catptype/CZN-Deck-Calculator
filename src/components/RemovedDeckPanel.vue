<!-- src/components/RemovedDeckPanel.vue -->
<template>
  <div class="removed-panel">
    <h3 class="text-lg font-bold text-white mb-3">Removed Cards</h3>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      
      <!-- Loop over the removedDeck array from the passed-in deck object -->
      <div 
        v-for="removedInfo in deck.removedDeck" 
        :key="removedInfo.card.id" 
        class="opacity-70 grayscale"
      >

        <div class="card-container relative flex flex-col bg-slate-800 rounded-lg shadow-md border border-slate-700 aspect-[2/3] overflow-hidden">
          <!-- Artwork -->
          <img 
            v-if="removedInfo.card.artworkUrl" 
            :src="removedInfo.card.artworkUrl" 
            alt=""
            class="absolute inset-0 w-full h-full object-cover z-0"
            :class="{ 'scale-x-[-1]': removedInfo.card.isDuplicate }"
          />

          <!-- Content Wrapper -->
          <div class="relative z-10 flex flex-col flex-grow">
            <!-- Header -->
            <div class="p-3 bg-slate-900/30">
              <div class="flex justify-between items-start gap-2">
                <h4 class="text-base font-bold text-slate-300 leading-tight">{{ removedInfo.card.name }}</h4>
                <span 
                  class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap -mt-1 -mr-1" 
                  :class="getCardTypeClass(removedInfo.card.type)"
                >
                  {{ removedInfo.card.type }}
                </span>
              </div>
            </div>
            
            <!-- Body -->
            <div class="flex-grow w-full h-full flex justify-center items-center p-3">
              <div v-if="removedInfo.card.epiphany !== EpiphanyType.None" class="text-center">
                <p class="text-sm font-semibold text-cyan-600">{{ removedInfo.card.epiphany }}</p>
              </div>
            </div>
            
            <!-- Footer with the Undo button -->
            <div class="p-2">
              <button 
                @click="store.undoRemove(deck.id, removedInfo.card.id)" 
                :class="[actionBtnClasses, 'bg-cyan-600 hover:bg-cyan-500 text-cyan-300']"
              >
                Undo Remove
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Deck, useMultiDeckStore } from '@/stores/multiDeck';
import { CardType, EpiphanyType } from '@/types/card';

// This component receives the entire deck object to get the removedDeck array
defineProps<{
  deck: Deck;
}>();

const store = useMultiDeckStore();

// --- Helper Functions & Styling ---
const actionBtnClasses = 'w-full text-xs font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const getCardTypeClass = (type: CardType) => {
  switch (type) {
    case CardType.Basic: return 'bg-gray-500 text-gray-100';
    case CardType.Job: return 'bg-blue-500 text-blue-100';
    case CardType.Unique: return 'bg-indigo-500 text-indigo-100';
    case CardType.Monster: return 'bg-red-500 text-red-100';
    case CardType.Neutral: return 'bg-sky-500 text-sky-100';
    case CardType.Forbidden: return 'bg-purple-500 text-purple-100';
    default: return 'bg-slate-600 text-slate-200';
  }
};
</script>