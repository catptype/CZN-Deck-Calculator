<template>
  <div v-if="deck" class="w-full bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col gap-6">
    <SummaryPanel :deck="deck" @reset="confirmAndReset" />
    <ActionsPanel :deck-id="deckId" />
    <ActiveDeckPanel :deck="deck" />
    <RemovedDeckPanel v-if="deck.removedDeck.length > 0" :deck="deck" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiDeckStore } from '@/stores/multiDeck';
import SummaryPanel from '@/components/SummaryPanel.vue';
import ActionsPanel from '@/components/ActionsPanel.vue';
import ActiveDeckPanel from '@/components/ActiveDeckPanel.vue';
import RemovedDeckPanel from '@/components/RemovedDeckPanel.vue';

const props = defineProps<{
  deckId: number;
}>();

const store = useMultiDeckStore();
const deck = computed(() => store.getDeckById(props.deckId));

const confirmAndReset = () => {
  if (window.confirm(`Are you sure you want to reset ${deck.value?.name}? All its changes will be lost.`)) {
    store.resetSingleDeck(props.deckId);
  }
}
</script>