<!-- src/components/CostCalculatorBreakdown.vue -->
<template>
  <div class="cost-breakdown bg-slate-900/70 backdrop-blur-sm p-5 rounded-xl shadow-lg">
    <h3 class="text-xl font-bold text-white mb-4">Cost Breakdown</h3>
    <div v-if="costBreakdown.length === 0" class="text-slate-400">
      No costs incurred yet.
    </div>
    <ul v-else class="space-y-2 text-slate-300">
      <li v-for="(item, index) in costBreakdown" :key="index" class="flex justify-between items-center text-sm">
        <span>{{ item.label }}</span>
        <span class="font-mono text-cyan-400">+{{ item.cost }}</span>
      </li>
    </ul>
    <hr class="border-slate-700 my-4" />
    <div class="flex justify-between items-center text-lg">
      <span class="font-bold text-white">Total Cost</span>
      <span class="font-bold font-mono" :class="{ 'text-red-400': store.totalCost > store.maxCost, 'text-green-400': store.totalCost <= store.maxCost }">
        {{ store.totalCost }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeckStore } from '@/stores/deck';
import { CardType } from '@/types/card';

const store = useDeckStore();

// This computed property generates the list of costs on the fly
const costBreakdown = computed(() => {
  const breakdown = [];

  // Helper for sequential costs
  const getSequentialCost = (count: number) => {
    const costs = [0, 10, 30, 50, 70];
    return count < costs.length ? costs[count] : 70;
  };

  // 1. Duplication Costs
  let duplicationCost = 0;
  for (let i = 0; i < store.duplicationCount; i++) duplicationCost += getSequentialCost(i);
  if (duplicationCost > 0) breakdown.push({ label: 'Duplication Actions', cost: duplicationCost });

  // 2. Removal Costs
  let removalCost = 0;
  for (let i = 0; i < store.removalCount; i++) removalCost += getSequentialCost(i);
  if (removalCost > 0) breakdown.push({ label: 'Removal Actions', cost: removalCost });

  // 3. Basic Removal Penalty
  if (store.basicRemovalPenalty > 0) {
    breakdown.push({ label: 'Basic Removal Penalty', cost: store.basicRemovalPenalty });
  }

  // 4. Added Card, Conversion, and Epiphany Costs
  let addedCardCost = 0;
  let conversionCost = 0;
  let epiphanyCost = 0;

  for (const card of store.deck) {
    // Added Card Costs
    if (card.id > 8 && !card.isDuplicate) {
      if (card.type === CardType.Monster) addedCardCost += 80;
      if (card.type === CardType.Neutral) addedCardCost += 20;
      if (card.type === CardType.Forbidden) addedCardCost += 20;
    }
    // Conversion Cost
    if (card.type === CardType.Neutral && card.originalType === CardType.Basic) {
      conversionCost += 10;
    }
    // Epiphany Costs
    if (card.epiphany === 'Normal Epiphany') epiphanyCost += 10;
    if (card.epiphany === 'Divine Epiphany') epiphanyCost += 20;
  }
  
  if (addedCardCost > 0) breakdown.push({ label: 'Added Cards', cost: addedCardCost });
  if (conversionCost > 0) breakdown.push({ label: 'Card Conversions', cost: conversionCost });
  if (epiphanyCost > 0) breakdown.push({ label: 'Epiphany Upgrades', cost: epiphanyCost });

  return breakdown;
});
</script>