<template>
  <div class="actions-panel bg-slate-900/70 p-4 rounded-xl shadow-lg">
    <h3 class="text-lg font-bold text-white mb-3">{{ t(`actions.addCard`) }}</h3>
    <div class="flex flex-wrap gap-2">
      <button 
        @click="store.addCard(deckId, CardType.Monster)" 
        :class="btnClasses"
        :disabled="isLocked">
        {{ t(`actions.addMonster`) }}
      </button>
      <button 
        @click="store.addCard(deckId, CardType.Neutral)" 
        :class="btnClasses"
        :disabled="isLocked">
        {{ t(`actions.addNeutral`) }}
      </button>
      <button 
        @click="store.addCard(deckId, CardType.Forbidden)" 
        :class="btnClasses"
        :disabled="isLocked">
        {{ t(`actions.addForbidden`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useMultiDeckStore } from '@/stores/multiDeck';
  import { CardType } from '@/types/card';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // This component receives the deckId to know which deck to add a card to.
  const props = defineProps<{ deckId: number; }>();

  const store = useMultiDeckStore();

  const isLocked = computed(() => {
    const deck = store.getDeckById(props.deckId);
    return !deck || deck.artworkPresetId === 'default';
  });

  // Styling for the "Add" buttons
  const btnClasses = `
    px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg 
    font-semibold text-white shadow-md 
    transform transition-transform 
  `;
</script>