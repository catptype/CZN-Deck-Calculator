<template>
  <div class="card-container relative flex flex-col bg-slate-700 rounded-lg shadow-md border border-slate-600 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/50 aspect-[2/3] overflow-hidden">

    <img 
      v-if="card.artworkUrl" 
      :src="card.artworkUrl" 
      alt=""
      class="absolute inset-0 w-full h-full object-cover z-0"
    />
    
    <div class="relative z-10 flex flex-col flex-grow">


    <!-- Card Header -->
    <div class="p-3 bg-slate-900/30">
      <div class="flex justify-between items-start gap-2 z-10">
        <h4 class="text-base font-bold text-white leading-tight">{{ card.name }}</h4>
        <span class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap -mt-1 -mr-1" :class="getCardTypeClass(card.type)">{{ card.type }}</span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex-grow w-full h-full flex justify-center items-center p-3">
      <div v-if="card.epiphany !== EpiphanyType.None" class="text-center">
        <p class="text-sm font-semibold text-cyan-300">{{ card.epiphany }}</p>
      </div>
    </div>

    <!-- Card Footer (Action buttons) -->
    <div class="card-actions bg-slate-900/50 p-2 flex flex-col gap-1.5">
      
      <!-- Epiphany button -->
      <div v-if="isEpiphanyUpgradeable" class="flex gap-1.5">
        <button 
          v-if="canHaveNormalEpiphany" 
          @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.Normal)" 
          :class="[actionBtnClasses, 'flex-1 bg-green-600/20 hover:bg-green-500/30 text-green-300']">
          N.Epiphany
        </button>
        <button 
          @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.Divine)" 
          :class="[actionBtnClasses, 'flex-1 bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-300']">
          D.Epiphany
        </button>
      </div>
      <div v-else-if="hasEpiphany">
        <button 
          @click="store.upgradeCard(props.deckId, card.id, EpiphanyType.None)" 
          :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">
          Undo Epiphany
        </button>
      </div>
      
      <!-- Convert button -->
      <button 
        v-if="isConvertible" 
        @click="store.convertCard(props.deckId, card.id)" 
        :class="[actionBtnClasses, 'bg-sky-600/20 hover:bg-sky-500/30 text-sky-300']">
        Convert
      </button>
      <button 
        v-if="isConverted" 
        @click="store.undoConvertCard(props.deckId, card.id)" 
        :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">
        Undo Convert
      </button>
      
      <!-- Undo Add button -->
      <div v-if="card.id > 8 && !card.isDuplicate">
        <button 
          @click="store.undoAddCard(props.deckId, card.id)" 
          :class="[actionBtnClasses, 'bg-teal-600/20 hover:bg-teal-500/30 text-teal-300']" 
          :disabled="isDuplicated" 
          :title="isDuplicated ? 'Cannot undo add after this card has been duplicated' : 'Undo adding this card'">
          Undo Add
        </button>
      </div>

      <!-- Duplicate / Undo duplicate button -->
      <button 
        v-if="card.isDuplicate" 
        @click="store.undoDuplicate(props.deckId, card.id)" 
        :class="[actionBtnClasses, 'bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300']">
        Undo Dupe
      </button>
      <button 
        v-else-if="card.type !== CardType.Basic && !(card.type === CardType.Neutral && card.originalType === CardType.Basic)"
        @click="store.duplicateCard(props.deckId, card.id)" 
        :class="[actionBtnClasses, 'bg-purple-600/20 hover:bg-purple-500/30 text-purple-300']">
        Duplicate
      </button>
      
      <!-- Remove button -->
      <button 
        @click="store.removeCard(props.deckId, card.id)" 
        :class="[actionBtnClasses, 'bg-red-600/20 hover:bg-red-500/30 text-red-300']">
        Remove
      </button>

    </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiDeckStore } from '@/stores/multiDeck';
import { type Card, CardType, EpiphanyType } from '@/types/card';

const props = defineProps<{
  card: Card;
  deckId: number;
}>();

const store = useMultiDeckStore();

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

// --- Logic
const canHaveNormalEpiphany = computed(() => {
  const disallowedTypes: CardType[] = [CardType.Job, CardType.Unique];
  return !disallowedTypes.includes(props.card.type);
});

const isEpiphanyUpgradeable = computed(() => 
  props.card.type !== CardType.Basic && props.card.epiphany === EpiphanyType.None
);

const hasEpiphany = computed(() =>
  props.card.type !== CardType.Basic && props.card.epiphany !== EpiphanyType.None
);

const isConvertible = computed(() => 
  props.card.type === CardType.Basic
);

const isConverted = computed(() => 
  props.card.type === CardType.Neutral && props.card.originalType === CardType.Basic
);

const isDuplicated = computed(() => {
  const deck = store.getDeckById(props.deckId);
  if (!deck) return true;
  return deck.card.some(c => c.originalId === props.card.id);
});

// --- Styling Constants ---
const actionBtnClasses = 'w-full text-xs font-bold py-1.5 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
</script>