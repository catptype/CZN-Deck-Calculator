<template>
  <div class="actions-panel bg-slate-900/70 p-4 rounded-xl shadow-lg">
    <h3 class="text-lg font-bold text-white mb-3">Add New Card</h3>
    <div class="flex flex-wrap gap-2">
      <button 
        @click="store.addCard(deckId, CardType.Monster)" 
        :class="btnClasses">
        Monster
      </button>
      <button 
        @click="store.addCard(deckId, CardType.Neutral)" 
        :class="btnClasses">
        Neutral
      </button>
      <button 
        @click="store.addCard(deckId, CardType.Forbidden)" 
        :class="btnClasses">
        Forbidden
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMultiDeckStore } from '@/stores/multiDeck';
import { CardType } from '@/types/card';

// This component receives the deckId to know which deck to add a card to.
defineProps<{ deckId: number; }>();

const store = useMultiDeckStore();

// Styling for the "Add" buttons
const btnClasses = `
  px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg 
  font-semibold text-white shadow-md 
  transform transition-transform 
`;
</script>