<template>
  <div class="actions-panel bg-slate-900/70 p-4 rounded-xl shadow-lg">
    <h3 class="text-lg font-bold text-white mb-3">Add New Card</h3>
    <div class="flex flex-wrap gap-2">
      <button @click="store.addCard(deckId, CardType.Monster)" :class="[btnClasses, 'bg-red-600 hover:bg-red-500']">
        + Monster
      </button>
      <button @click="store.addCard(deckId, CardType.Neutral)" :class="[btnClasses, 'bg-sky-600 hover:bg-sky-500']">
        + Neutral
      </button>
      <button @click="store.addCard(deckId, CardType.Forbidden)" :class="[btnClasses, 'bg-purple-600 hover:bg-purple-500']">
        + Forbidden
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
const btnClasses = 'flex-grow basis-0 px-3 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800';
</script>