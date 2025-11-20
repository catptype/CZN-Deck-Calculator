<template>
  <div v-if="deck" class="w-full bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
    
    <!-- New 2-Column Grid Wrapper -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Left Column (for Summary) -->
      <div class="md:col-span-1">
        <SummaryPanel :deck="deck" @reset="confirmAndReset" />
      </div>

      <!-- Right Column (for all other panels) -->
      <div class="md:col-span-2 flex flex-col gap-6">
        <ActionsPanel :deck-id="deckId" />
        <ActiveDeckPanel :deck="deck" />
        <RemovedDeckPanel v-if="deck.removedDeck.length > 0" :deck="deck" />
      </div>

    </div>
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