<template>
  <div class="deck-manager p-4 md:p-6 lg:p-8 bg-slate-800 min-h-screen text-slate-300">
    <div class="max-w-7xl mx-auto">

      <!-- Summary Panel -->
      <div class="summary-panel bg-slate-900/70 backdrop-blur-sm p-5 rounded-xl shadow-lg mb-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 class="text-2xl font-bold text-white whitespace-nowrap">Deck Summary</h2>
          
          <!-- Grouping div for all controls on the right -->
          <div class="flex w-full md:w-auto flex-wrap items-center justify-end gap-4">
            <div class="tier-control flex items-center gap-3">
              <label for="deck-tier" class="font-semibold text-slate-200">Deck Tier:</label>
              <input type="number" id="deck-tier" :value="store.deckTier" @input="updateTier($event)" min="1" class="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 w-20 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
            </div>

            <div 
              class="relative" 
              @mouseenter="isBreakdownVisible = true" 
              @mouseleave="isBreakdownVisible = false"
            >
              <div class="cost-display text-xl md:text-2xl font-mono cursor-pointer">
                <strong class="font-semibold text-slate-200">Total Cost:</strong>
                <span :class="{ 'text-red-400': store.totalCost > store.maxCost, 'text-green-400': store.totalCost <= store.maxCost }" class="font-bold ml-2">{{ store.totalCost }}</span>
                <span class="text-slate-400"> / {{ store.maxCost }}</span>
              </div>
              
              <!-- *** STEP 2: ADD THE COST BREAKDOWN POPOVER *** -->
              <div v-if="isBreakdownVisible" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 p-3">
              <h4 class="font-bold text-white text-base mb-2 border-b border-slate-600 pb-2">Cost Breakdown</h4>
              <div v-if="store.costBreakdown.length > 0" class="flex flex-col gap-2 text-sm">
                
                <!-- Outer loop for parent nodes (e.g., "General Actions" or a card name) -->
                <div v-for="(item, index) in store.costBreakdown" :key="index">
                  <div class="flex justify-between items-center font-semibold">
                    <span class="text-white">{{ item.label }}</span>
                  </div>
                  
                  <!-- Inner loop for children, rendered only if they exist -->
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

            <!-- *** NEW RESET BUTTON IS HERE *** -->
            <button @click="confirmAndReset" :class="[btnClasses, 'bg-orange-600 hover:bg-orange-500 focus:ring-orange-400']">
              Reset Deck
            </button>
          </div>

        </div>
      </div>
      
      <!-- Actions, Deck, and Removed Panels (No changes here) -->
      <div class="actions-panel bg-slate-900/70 p-5 rounded-xl shadow-lg mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Add New Card</h3>
        <div class="flex flex-wrap gap-3">
          <button @click="store.addCard(CardType.Monster)" :class="[btnClasses, 'bg-red-600 hover:bg-red-500']">+ Monster</button>
          <button @click="store.addCard(CardType.Neutral)" :class="[btnClasses, 'bg-sky-600 hover:bg-sky-500']">+ Neutral</button>
          <button @click="store.addCard(CardType.Forbidden)" :class="[btnClasses, 'bg-purple-600 hover:bg-purple-500']">+ Forbidden</button>
        </div>
      </div>
      
      <div class="deck-panel mb-12">
        <h3 class="text-xl font-bold text-white mb-4">Current Deck ({{ store.deck.length }} cards)</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <div v-for="card in store.deck" :key="card.id" class="card-container flex flex-col justify-between bg-slate-700 rounded-lg shadow-md border border-slate-600 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/50">
            <div class="p-4">
              <div class="flex justify-between items-start">
                <h4 class="text-lg font-bold text-white">{{ card.name }}</h4>
                <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="getCardTypeClass(card.type)">{{ card.type }}</span>
              </div>
              <p v-if="card.epiphany !== 'None'" class="text-sm text-cyan-400 mt-1">{{ card.epiphany }}</p>
            </div>
            <div class="card-actions bg-slate-900/50 p-3 rounded-b-lg flex flex-col gap-2 mt-4">
                <div v-if="card.type !== CardType.Basic && card.epiphany === EpiphanyType.None" class="flex gap-2">
                    <button v-if="![CardType.Job, CardType.Unique].includes(card.type)" @click="store.upgradeCard(card.id, EpiphanyType.Normal)" :class="[actionBtnClasses, 'flex-1', 'bg-green-600/20 hover:bg-green-500/30 text-green-300']">N.Epiphany <span class="font-mono">(+10)</span></button>
                    <button @click="store.upgradeCard(card.id, EpiphanyType.Divine)" :class="[actionBtnClasses, 'flex-1', 'bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-300']">D.Epiphany <span class="font-mono">(+20)</span></button>
                </div>
                <div v-else-if="card.type !== CardType.Basic && card.epiphany !== EpiphanyType.None">
                  <button @click="store.upgradeCard(card.id, EpiphanyType.None)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">
                    Undo Epiphany <span class="font-mono">(-{{ card.epiphany === EpiphanyType.Normal ? 10 : 20 }})</span>
                  </button>
                </div>
                <button v-if="card.type === CardType.Basic" @click="store.convertCard(card.id)" :class="[actionBtnClasses, 'bg-sky-600/20 hover:bg-sky-500/30 text-sky-300']">Convert <span class="font-mono">(+10)</span></button>
                <button v-if="card.type === CardType.Neutral && card.originalType === CardType.Basic" @click="store.undoConvertCard(card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Convert <span class="font-mono">(-10)</span></button>
                <div v-if="card.id > 8 && !card.isDuplicate">
                  <button @click="store.undoAddCard(card.id)" :class="[actionBtnClasses, 'bg-teal-600/20 hover:bg-teal-500/30 text-teal-300']" :disabled="isCardLocked(card.id)" :title="store.removalCount > 0 || store.duplicationCount > 0 ? 'Cannot undo add after other actions' : 'Undo adding this card'">Undo Add Card</button>
                </div>
                <button v-if="card.isDuplicate" @click="store.undoDuplicate(card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Duplicate <span class="font-mono">(-{{ store.lastDuplicationCost }})</span></button>
                <button v-else-if="card.type !== CardType.Basic && !(card.type === CardType.Neutral && card.originalType === CardType.Basic)" @click="store.duplicateCard(card.id)" :class="[actionBtnClasses, 'bg-purple-600/20 hover:bg-purple-500/30 text-purple-300']">Duplicate <span class="font-mono">(+{{ store.nextDuplicationCost }})</span></button>
                <button @click="store.removeCard(card.id)" :class="[actionBtnClasses, 'bg-red-600/20 hover:bg-red-500/30 text-red-300']">Remove <span class="font-mono">(+{{ store.nextRemovalCost }})</span></button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="store.removedDeck.length > 0" class="removed-panel">
        <h3 class="text-xl font-bold text-white mb-4">Removed Cards</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <div v-for="removedInfo in store.removedDeck" :key="removedInfo.card.id" class="card-container flex flex-col justify-between bg-slate-800 rounded-lg shadow-md border border-slate-700 opacity-70 grayscale">
            <div class="p-4">
              <div class="flex justify-between items-start">
                <h4 class="text-lg font-bold text-slate-300">{{ removedInfo.card.name }}</h4>
                <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="getCardTypeClass(removedInfo.card.type)">{{ removedInfo.card.type }}</span>
              </div>
              <p v-if="removedInfo.card.epiphany !== 'None'" class="text-sm text-cyan-600 mt-1">{{ removedInfo.card.epiphany }}</p>
            </div>
            <div class="p-3 mt-4">
              <button @click="store.undoRemove(removedInfo.card.id)" :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">Undo Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDeckStore } from '@/stores/deck'
import { CardType, EpiphanyType } from '@/types/card'

const store = useDeckStore()

const isBreakdownVisible = ref(false)

const confirmAndReset = () => {
  if (window.confirm('Are you sure you want to reset the deck? All changes will be lost.')) {
    store.resetDeck();
  }
}

const isCardLocked = (cardId: number): boolean => {
  return store.deck.some(c => c.originalId === cardId);
}

// --- STYLING LOGIC ---
const btnClasses = 'px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800'
const actionBtnClasses = 'w-full text-xs font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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

// --- COMPONENT LOGIC ---
const updateTier = (event: Event) => {
  const target = event.target as HTMLInputElement
  store.setDeckTier(Number(target.value))
}
</script>