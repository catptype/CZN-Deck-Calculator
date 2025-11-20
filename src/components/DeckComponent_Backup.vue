<template>
  <div v-if="deck" class="w-full bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col gap-6">
    
    <!-- Summary Panel -->
    <div class="summary-panel bg-slate-900/70 backdrop-blur-sm p-4 rounded-xl shadow-lg">
      <!-- Top row: Deck Name and Reset Button -->
      <div class="flex justify-between items-center gap-4 mb-4">
        <h3 class="text-xl font-bold text-white">{{ deck.name }}</h3>
        <button @click="confirmAndReset" :class="[resetBtnClasses, 'bg-orange-600/20 hover:bg-orange-500/30 text-orange-300 px-3']">
          Reset
        </button>
      </div>
      
      <!-- Bottom row: Cost display and the new Breakdown trigger -->
      <div 
        class="relative flex justify-between items-center"
        :class="{ 'z-20': isBreakdownVisible }"
      >
        <!-- The cost display itself -->
        <div class="cost-display text-lg font-mono">
          <strong class="font-semibold text-slate-200">Cost:</strong>
          <span :class="{ 'text-red-400': store.totalCost(deck) > store.maxCost, 'text-green-400': store.totalCost(deck) <= store.maxCost }" class="font-bold ml-2">{{ store.totalCost(deck) }}</span>
          <span class="text-slate-400"> / {{ store.maxCost }}</span>
        </div>

        <!-- The new Breakdown trigger area -->
        <div 
          class="relative"
          @mouseenter="isBreakdownVisible = true"
          @mouseleave="isBreakdownVisible = false"
        >
          <!-- The Information Icon -->
          <div class="cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <!-- The Popover (now positioned relative to the icon) -->
          <div v-if="isBreakdownVisible" class="absolute top-full right-0 mt-2 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 p-3">
            <h4 class="font-bold text-white text-base mb-2 border-b border-slate-600 pb-2">Cost Breakdown</h4>
            <div v-if="store.costBreakdown(deck).length > 0" class="flex flex-col gap-2 text-sm">
              <div v-for="(item, index) in store.costBreakdown(deck)" :key="index">
                <div class="flex justify-between items-center font-semibold">
                  <span class="text-white">{{ item.label }}</span>
                </div>
                <div v-if="item.children && item.children.length > 0" class="flex flex-col gap-1 pl-4 mt-1 border-l-2 border-slate-600">
                  <div v-for="(child, childIndex) in item.children" :key="childIndex" class="flex justify-between items-center">
                    <span class="text-slate-300">{{ child.label }}</span>
                    <span class="font-mono text-cyan-400">+{{ child.cost }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-slate-400 text-sm italic">
              No costs yet.
            </div>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- Actions Panel -->
    <div class="actions-panel bg-slate-900/70 p-4 rounded-xl shadow-lg">
      <h3 class="text-lg font-bold text-white mb-3">Add New Card</h3>
      <div class="flex flex-wrap gap-2">
        <button @click="store.addCard(props.deckId, CardType.Monster)" :class="[btnClasses, 'bg-red-600 hover:bg-red-500']">+ Monster</button>
        <button @click="store.addCard(props.deckId, CardType.Neutral)" :class="[btnClasses, 'bg-sky-600 hover:bg-sky-500']">+ Neutral</button>
        <button @click="store.addCard(props.deckId, CardType.Forbidden)" :class="[btnClasses, 'bg-purple-600 hover:bg-purple-500']">+ Forbidden</button>
      </div>
    </div>
    
    <!-- Active Deck -->
    <div class="deck-panel">
      <h3 class="text-lg font-bold text-white mb-3">Current Deck ({{ deck.deck.length }} cards)</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div v-for="card in deck.deck" :key="card.id" class="card-container flex flex-col bg-slate-700 rounded-lg shadow-md border border-slate-600 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/50 aspect-[2/3] overflow-hidden">
          <div class="p-3 bg-slate-900/30">
            <div class="flex justify-between items-start gap-2">
              <h4 class="text-base font-bold text-white leading-tight">{{ card.name }}</h4>
              <span class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap -mt-1 -mr-1" :class="getCardTypeClass(card.type)">{{ card.type }}</span>
            </div>
          </div>
          <div class="flex-grow w-full h-full flex justify-center items-center p-3">
            <div v-if="card.epiphany !== EpiphanyType.None" class="text-center">
              <p class="text-sm font-semibold text-cyan-300">{{ card.epiphany }}</p>
            </div>
          </div>
          <div class="card-actions bg-slate-900/50 p-2 flex flex-col gap-1.5">
              <div v-if="card.type !== CardType.Basic && card.epiphany === EpiphanyType.None" class="flex gap-1.5">
                  <button v-if="canHaveNormalEpiphany(card.type)" @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.Normal)" :class="[actionBtnClasses, 'flex-1', 'bg-green-600/20 hover:bg-green-500/30 text-green-300']">N.Epiphany</button>
                  <button @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.Divine)" :class="[actionBtnClasses, 'flex-1', 'bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-300']">D.Epiphany</button>
              </div>
              <div v-else-if="card.type !== CardType.Basic && card.epiphany !== EpiphanyType.None">
                <button @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.None)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Epiphany</button>
              </div>
              <button v-if="card.type === CardType.Basic" @click="store.convertCard(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-sky-600/20 hover:bg-sky-500/30 text-sky-300']">Convert</button>
              <button v-if="card.type === CardType.Neutral && card.originalType === CardType.Basic" @click="store.undoConvertCard(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Convert</button>
              <div v-if="card.id > 8 && !card.isDuplicate">
                <button @click="store.undoAddCard(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-teal-600/20 hover:bg-teal-500/30 text-teal-300']" :disabled="isCardLocked(card.id)" :title="isCardLocked(card.id) ? 'Cannot undo add after this card has been duplicated' : 'Undo adding this card'">Undo Add</button>
              </div>
              <button v-if="card.isDuplicate" @click="store.undoDuplicate(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Dupe</button>
              <button v-else-if="card.type !== CardType.Basic && !(card.type === CardType.Neutral && card.originalType === CardType.Basic)" @click="store.duplicateCard(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-purple-600/20 hover:bg-purple-500/30 text-purple-300']">Duplicate</button>
              <button @click="store.removeCard(props.deckId, card.id)" :class="[actionBtnClasses, 'bg-red-600/20 hover:bg-red-500/30 text-red-300']">Remove</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Removed Cards Section -->
    <div v-if="deck.removedDeck.length > 0" class="removed-panel">
      <h3 class="text-lg font-bold text-white mb-3">Removed Cards</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div v-for="removedInfo in deck.removedDeck" :key="removedInfo.card.id" class="card-container flex flex-col bg-slate-800 rounded-lg shadow-md border border-slate-700 aspect-[2/3] overflow-hidden opacity-70 grayscale">
          <div class="p-3 bg-slate-900/30">
            <div class="flex justify-between items-start gap-2">
              <h4 class="text-base font-bold text-slate-300 leading-tight">{{ removedInfo.card.name }}</h4>
              <span class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap -mt-1 -mr-1" :class="getCardTypeClass(removedInfo.card.type)">{{ removedInfo.card.type }}</span>
            </div>
          </div>
          <div class="flex-grow w-full h-full flex justify-center items-center p-3">
            <div v-if="removedInfo.card.epiphany !== EpiphanyType.None" class="text-center">
              <p class="text-sm font-semibold text-cyan-600">{{ removedInfo.card.epiphany }}</p>
            </div>
          </div>
          <div class="p-2">
            <button @click="store.undoRemove(props.deckId, removedInfo.card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMultiDeckStore } from '@/stores/multiDeck';
import { CardType, EpiphanyType } from '@/types/card';

const props = defineProps<{
  deckId: number;
}>();

const store = useMultiDeckStore();
const isBreakdownVisible = ref(false);

const deck = computed(() => store.getDeckById(props.deckId));

const confirmAndReset = () => {
  if (window.confirm(`Are you sure you want to reset ${deck.value?.name}? All its changes will be lost.`)) {
    store.resetSingleDeck(props.deckId);
  }
}

const canHaveNormalEpiphany = (type: CardType): boolean => {
  const disallowedTypes: CardType[] = [CardType.Job, CardType.Unique];
  return !disallowedTypes.includes(type);
}

const isCardLocked = (cardId: number): boolean => {
  if (!deck.value) return true;
  return deck.value.deck.some(c => c.originalId === cardId);
};

const btnClasses = 'flex-grow basis-0 px-3 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800';
const actionBtnClasses = 'w-full text-xs font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const resetBtnClasses = 'w-auto text-xl font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

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
}
</script>