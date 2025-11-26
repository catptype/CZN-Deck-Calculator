<template>
  <div class="card-container group relative flex flex-col bg-slate-700 rounded-lg shadow-md border border-slate-600 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/50 aspect-[2/3] overflow-hidden">
    
    <!-- Artwork -->
    <img 
      v-if="card.artworkUrl" 
      :src="card.artworkUrl" 
      :alt="card.name"
      class="absolute inset-0 w-full h-full object-cover z-0"
      :class="{ 'scale-x-[-1]': isDuplicate }"
    />
    
    <!-- Header -->
    <div class="relative z-10 p-3 bg-gradient-to-b from-black/90 to-transparent">
      <div class="flex justify-between items-start gap-2">
        <h4 class="text-base font-bold text-white leading-tight drop-shadow-lg">{{ t(card.name) }}</h4>
        <span class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap -mt-1 -mr-1" :class="getCardTypeClass(card.type)">{{ card.type }}</span>
      </div>
    </div>

    <!-- *** NEW, SIMPLIFIED OVERLAY SYSTEM *** -->
    
    <!-- 1. Static Epiphany Icon (Always visible if active) -->
    <div v-if="hasEpiphany" class="absolute top-[18%] left-2 w-full z-20">
      <img v-if="card.epiphany === EpiphanyType.Normal" src="/icons/normal_epiphany.png" alt="Normal Epiphany" class="w-[25%] -translate-x-1" />
      <img v-else-if="card.epiphany === EpiphanyType.Divine" src="/icons/divine_epiphany.png" alt="Divine Epiphany" class="w-[20%]" />
    </div>

    <!-- 2. Hover/Focus Action Overlay -->
    <div class="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
      <!-- Epiphany TOGGLE Button (only appears on hover) -->
      <button 
        v-if="card.type !== CardType.Basic && !isDeckLocked"
        @click.stop="toggleEpiphany" 
        class="absolute bottom-5 left-2 h-auto w-8 rounded-md bg-black/50 hover:bg-cyan-500/50 transition-colors flex items-center justify-center"
        :title="epiphanyToggleTitle">
        <img v-if="card.epiphany === EpiphanyType.Normal" src="/icons/normal_epiphany.png" alt="Normal Epiphany" class="h-8 w-8" />
        <img v-else-if="card.epiphany === EpiphanyType.Divine" src="/icons/divine_epiphany.png" alt="Divine Epiphany" class="h-12 w-8" />
        <div v-else class="h-8 w-8 flex items-center justify-center">
          <svg class="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </div>
      </button>
      
      <!-- Other Action Icons (only appear on hover) -->
      <div class="absolute bottom-2 right-2 flex flex-col items-end gap-2">
        <!-- Undo Add -->
        <button v-if="isUndoAddable" @click.stop="store.undoAddCard(deckId, card.id)" class="h-8 w-8 bg-black/50 hover:bg-cyan-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-5 w-5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        </button>
        <!-- Undo Convert -->
        <button v-if="isConverted && !isDeckLocked" @click.stop="store.undoConvertCard(deckId, card.id)" class="h-8 w-8 bg-black/50 hover:bg-cyan-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-5 w-5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        </button>
        <!-- Undo Duplicate -->
        <button v-if="isDuplicate && !isDeckLocked" @click.stop="store.undoDuplicate(deckId, card.id)" title="Undo Duplicate" class="h-8 w-8 bg-black/50 hover:bg-cyan-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-5 w-5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        </button>
        <!-- Convert -->
        <button v-if="isConvertible && !isDeckLocked" @click.stop="store.convertCard(deckId, card.id)" class="h-8 w-8 bg-black/50 hover:bg-sky-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-5 w-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0 0v-4.992" /></svg>
        </button>
        <!-- Duplicate -->
        <button v-if="canBeDuplicated && !isDuplicate && !isDeckLocked" @click.stop="store.duplicateCard(deckId, card.id)" class="h-8 w-8 bg-black/50 hover:bg-purple-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
        <!-- Remove -->
        <button v-if="!isDeckLocked" @click.stop="store.removeCard(deckId, card.id)" class="h-8 w-8 bg-black/50 hover:bg-red-500/50 rounded-full transition-colors flex items-center justify-center">
          <svg class="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiDeckStore } from '@/stores/multiDeck';
import { type Card, CardType, EpiphanyType } from '@/types/card';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
  card: Card;
  deckId: number;
}>();

const store = useMultiDeckStore();

// --- Epiphany Toggle Logic ---
const toggleEpiphany = () => {
  const current = props.card.epiphany;
  let next: EpiphanyType;

  // The cycle: None -> Normal -> Divine -> None
  if (current === EpiphanyType.None) {
    // Skip to Divine if Normal is not allowed
    next = canHaveNormalEpiphany.value ? EpiphanyType.Normal : EpiphanyType.Divine;
  } else if (current === EpiphanyType.Normal) {
    next = EpiphanyType.Divine;
  } else { // current is Divine
    next = EpiphanyType.None;
  }
  
  store.upgradeCard(props.deckId, props.card.id, next);
};

const epiphanyToggleTitle = computed(() => {
  if (props.card.epiphany === EpiphanyType.None) return 'Add Epiphany';
  if (props.card.epiphany === EpiphanyType.Normal) return 'Upgrade to Divine';
  return 'Remove Epiphany';
});

// --- Computed Properties ---
const isDeckLocked = computed(() => {
  const deck = store.getDeckById(props.deckId);
  return !deck || deck.artworkPresetId === 'default';
});

const canHaveNormalEpiphany = computed(() => !([CardType.Job, CardType.Unique] as CardType[]).includes(props.card.type));

// This is now just a check if the card is a type that can have any epiphany
const hasEpiphany = computed(() => props.card.epiphany !== EpiphanyType.None);

const isConvertible = computed(() => props.card.type === CardType.Basic);
const isConverted = computed(() => props.card.type === CardType.Neutral && props.card.originalType === CardType.Basic);
const isDuplicate = computed(() => props.card.isDuplicate);
const canBeDuplicated = computed(() => props.card.type !== CardType.Basic && !(props.card.type === CardType.Neutral && props.card.originalType === CardType.Basic));
const hasBeenDuplicated = computed(() => {
  const deck = store.getDeckById(props.deckId);
  if (!deck) return true;
  return deck.card.some(c => c.originalId === props.card.id);
});

const isUndoAddable = computed(() => 
  props.card.id > 8 && !props.card.isDuplicate
);


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
const btnIcon = `bg-black/50 p-2 w-full aspect-square rounded-full`;
</script>