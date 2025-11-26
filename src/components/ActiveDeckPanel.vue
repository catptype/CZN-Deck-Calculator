<!-- src/components/ActiveDeckPanel.vue -->
<template>
  <div class="deck-panel">
    <h3 class="text-lg font-bold text-white mb-3">{{ t('deckPanel.currentDeck') }} ({{ deck.card.length }} {{ t('deckPanel.cardUnit') }})</h3>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <CardComponent v-for="card in deck.card" :key="card.id" :card="card" :deck-id="deck.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deck } from '@/stores/multiDeck';
import CardComponent from '@/components/Card.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

defineProps<{ deck: Deck }>();
</script>