<template>
  <div class="p-4 bg-slate-900 min-h-screen text-slate-300">
    <div class="max-w-screen-lg mx-auto">

      <a 
        href="https://github.com/catptype/CZN-Deck-Calculator" 
        target="_blank" 
        rel="noopener noreferrer"
        title="View on GitHub"
        class="fixed top-4 right-4 z-50 text-slate-400 hover:text-white transition-colors"
        aria-label="View source code on GitHub">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>

      <!-- Global Header -->
      <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="bg-slate-800/50 p-4 rounded-xl shadow-lg flex flex-col justify-between items-center gap-4 border border-slate-700">
          <select v-model="locale">
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
          <h1 class="text-3xl font-bold text-white">{{ t(`home.title`) }}</h1>
          
          <div class="flex items-center gap-4">
            <div class="tier-control flex items-center gap-3">
              <label for="deck-tier" class="font-semibold text-slate-200 whitespace-nowrap">{{ t(`home.chaosTier`) }}</label>
              <input 
                type="number" 
                id="deck-tier" 
                :value="store.sharedDeckTier" 
                @input="updateTier($event)" 
                min="1" 
                class="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 w-20 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <button @click="confirmAndResetAll" :class="[btnClasses, 'bg-orange-600 hover:bg-orange-500 focus:ring-orange-400']">
              {{ t(`home.resetAll`) }}
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
import { useI18n } from 'vue-i18n';
import DeckComponent from '@/components/DeckComponent.vue';

const { t, locale } = useI18n();
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

const btnClasses = `
  px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg 
  font-semibold text-white shadow-md 
  transform transition-transform 
`;
</script>