import { defineStore } from 'pinia'
import type { Card } from '@/types/card'
import type { Preset } from '@/types/preset'
import { CardType, EpiphanyType } from '@/types/card'

const SEQUENTIAL_COSTS = [0, 10, 30, 50, 70]
const getSequentialCost = (count: number): number => {
  if (count < SEQUENTIAL_COSTS.length) {
    return SEQUENTIAL_COSTS[count]!; // Add the "!" at the end to assert that this is not undefined
  }
  return 70
}

// NEW: This interface is for storing removed cards with their original position
interface RemovedCardInfo {
  card: Card;
  originalIndex: number;
}

export interface BreakdownNode {
  label: string;
  cost: number;
  children?: BreakdownNode[]; // The key change: an optional array of children
}

export interface Deck {
  id: number;
  name: string;
  artworkPresetId: string; // e.g., 'mika' or 'default'
  card: Card[];
  removedDeck: RemovedCardInfo[];
  removalCount: number;
  duplicationCount: number;
  basicRemovalPenalty: number;
  totalConversionCost: number;
  monsterAddCount: number;
  neutralAddCount: number;
  forbiddenAddCount: number;
  nextCardId: number;
}

export interface MultiDeckState {
  decks: Deck[];
  sharedDeckTier: number;
}

const createDefaultDeck = (id: number, name: string): Deck => ({
  id,
  name,
  artworkPresetId: 'default',
  card: [
    { id: 1, name: 'Basic 1', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
    { id: 2, name: 'Basic 2', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
    { id: 3, name: 'Basic 3', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
    { id: 4, name: 'Job', type: CardType.Job, originalType: CardType.Job, epiphany: EpiphanyType.None },
    { id: 5, name: 'Unique 1', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
    { id: 6, name: 'Unique 2', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
    { id: 7, name: 'Unique 3', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
    { id: 8, name: 'Unique 4', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
  ],
  removedDeck: [],
  removalCount: 0,
  duplicationCount: 0,
  basicRemovalPenalty: 0,
  totalConversionCost: 0,
  monsterAddCount: 0,
  neutralAddCount: 0,
  forbiddenAddCount: 0,
  nextCardId: 9,
});

export const useMultiDeckStore = defineStore('multiDeck', {
  state: (): MultiDeckState => ({
    decks: [
      createDefaultDeck(1, 'Select Character'),
      createDefaultDeck(2, 'Select Character'),
      createDefaultDeck(3, 'Select Character'),
    ],
    sharedDeckTier: 1,
  }),

  getters: {
    getDeckById: (state) => (deckId: number): Deck | undefined => {
      return state.decks.find(d => d.id === deckId);
    },
    maxCost: (state) => 20 + state.sharedDeckTier * 10,

    // No changes to getters, they will work with the new state
    nextRemovalCost: () => (deck: Deck) => getSequentialCost(deck.removalCount),
    nextDuplicationCost: () => (deck: Deck) => getSequentialCost(deck.duplicationCount),

    lastDuplicationCost: () => (deck: Deck) => {
      if (deck.duplicationCount === 0) return 0;
      return getSequentialCost(deck.duplicationCount - 1);
    },

    costBreakdown: () => (deck: Deck): BreakdownNode[] => {
      const breakdown: BreakdownNode[] = [];
      const actionCosts: BreakdownNode[] = [];
      for (let i = 0; i < deck.duplicationCount; i++) actionCosts.push({ label: `Duplication Action #${i + 1}`, cost: getSequentialCost(i) });
      for (let i = 0; i < deck.removalCount; i++) actionCosts.push({ label: `Removal Action #${i + 1}`, cost: getSequentialCost(i) });
      if (deck.basicRemovalPenalty > 0) actionCosts.push({ label: 'Basic Removal Penalty', cost: deck.basicRemovalPenalty });
      if (deck.totalConversionCost > 0) actionCosts.push({ label: 'Card Conversion(s)', cost: deck.totalConversionCost });
      if (actionCosts.length > 0) breakdown.push({ label: 'General Actions', cost: actionCosts.reduce((sum, item) => sum + item.cost, 0), children: actionCosts });
      for (const card of deck.card) {
        const cardCosts: BreakdownNode[] = [];
        if (card.type === CardType.Monster) cardCosts.push({ label: 'Base Cost', cost: 80 });
        else if (card.type === CardType.Neutral && card.originalType !== CardType.Basic) cardCosts.push({ label: 'Base Cost', cost: 20 });
        else if (card.type === CardType.Forbidden) cardCosts.push({ label: 'Base Cost', cost: 20 });
        if (card.epiphany === EpiphanyType.Normal) cardCosts.push({ label: 'Normal Epiphany', cost: 10 });
        else if (card.epiphany === EpiphanyType.Divine) cardCosts.push({ label: 'Divine Epiphany', cost: 20 });
        if (cardCosts.length > 0) breakdown.push({ label: card.name, cost: cardCosts.reduce((sum, item) => sum + item.cost, 0), children: cardCosts });
      }
      return breakdown;
    },

    totalCost: () => (deck: Deck): number => {
      let cost = 0;
      for (let i = 0; i < deck.removalCount; i++) cost += getSequentialCost(i);
      for (let i = 0; i < deck.duplicationCount; i++) cost += getSequentialCost(i);
      cost += deck.basicRemovalPenalty;
      cost += deck.totalConversionCost;
      for (const card of deck.card) {
        if (card.type === CardType.Monster) cost += 80;
        else if (card.type === CardType.Neutral && card.originalType !== CardType.Basic) cost += 20;
        else if (card.type === CardType.Forbidden) cost += 20;
        if (card.epiphany === EpiphanyType.Normal) cost += 10;
        else if (card.epiphany === EpiphanyType.Divine) cost += 20;
      }
      return cost;
    },
  },

  actions: {

    applyArtworkPreset(deckId: number, preset: Preset) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      deck.name = preset.name;
      deck.artworkPresetId = preset.id;

      // Map artwork to the 8 initial cards
      const artMap = preset.cardArtwork;
      deck.card.forEach(card => {
        const basePath = `/presets/${preset.id}/`;
        if (card.id === 1) card.artworkUrl = basePath + artMap.basic1 + '.png';
        if (card.id === 2) card.artworkUrl = basePath + artMap.basic2 + '.png';
        if (card.id === 3) card.artworkUrl = basePath + artMap.basic3 + '.png';
        if (card.id === 4) card.artworkUrl = basePath + artMap.job + '.png';
        if (card.id === 5) card.artworkUrl = basePath + artMap.unique1 + '.png';
        if (card.id === 6) card.artworkUrl = basePath + artMap.unique2 + '.png';
        if (card.id === 7) card.artworkUrl = basePath + artMap.unique3 + '.png';
        if (card.id === 8) card.artworkUrl = basePath + artMap.unique4 + '.png';
      });
    },

    setSharedDeckTier(tier: number) {
      if (tier > 0) this.sharedDeckTier = tier;
    },

    resetAllDecks() {
      this.$reset();
    },

    resetSingleDeck(deckId: number) {
      const deckIndex = this.decks.findIndex(d => d.id === deckId);
      if (deckIndex !== -1) {
        const deck = this.decks[deckIndex]!;
        deck.name = "Select Character";
        this.decks[deckIndex] = createDefaultDeck(deck.id, deck.name);
      }
    },
    
    addCard(deckId: number, type: CardType) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      let cardName = `${type}`;
      if (type === CardType.Monster) { 
        deck.monsterAddCount++; 
        cardName = `${type} ${deck.monsterAddCount}`; 
      } else if (type === CardType.Neutral) { 
        deck.neutralAddCount++; 
        cardName = `${type} ${deck.neutralAddCount}`; 
      } else if (type === CardType.Forbidden) { 
        deck.forbiddenAddCount++; 
        cardName = `${type} ${deck.forbiddenAddCount}`; 
      }
      
      const newCard: Card = { id: deck.nextCardId++, name: cardName, type, originalType: type, epiphany: EpiphanyType.None };
      deck.card.push(newCard);
    },

    undoAddCard(deckId: number, cardIdToUndo: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const hasDuplicates = deck.card.some(c => c.originalId === cardIdToUndo);

      if (hasDuplicates) {
          console.warn("Cannot undo adding a card after it has been duplicated.");
          return;
      }

      const cardIndex = deck.card.findIndex(c => c.id === cardIdToUndo);
      if (cardIndex === -1) return;

      const card = deck.card[cardIndex];
      if (!card) return;

      if (card.id <= 8 || card.isDuplicate) return;

      // If all checks pass, perform the action
      deck.card.splice(cardIndex, 1);
    },
    
    removeCard(deckId: number, cardIdToRemove: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const cardIndex = deck.card.findIndex(c => c.id === cardIdToRemove);
      if (cardIndex === -1) return;
      
      const cardToMove = deck.card[cardIndex];
      if (!cardToMove) return; 
  
      if (cardToMove.type === CardType.Basic) {
        deck.basicRemovalPenalty += 20;
      }
      deck.removedDeck.push({ card: cardToMove, originalIndex: cardIndex }); // Store as object
      deck.card.splice(cardIndex, 1);
      deck.removalCount++;
    },

    undoRemove(deckId: number, cardIdToRestore: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const removedInfoIndex = deck.removedDeck.findIndex(info => info.card.id === cardIdToRestore);
      if (removedInfoIndex === -1) return;

      const removedInfo = deck.removedDeck[removedInfoIndex];
      if (!removedInfo) return;

      const { card, originalIndex } = removedInfo;

      if (card.type === CardType.Basic) {
        deck.basicRemovalPenalty -= 20;
      }
      deck.card.splice(originalIndex, 0, card); // Splice back into original position
      deck.removedDeck.splice(removedInfoIndex, 1);
      deck.removalCount--;
    },
    
    duplicateCard(deckId: number, cardIdToDuplicate: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const originalIndex = deck.card.findIndex(c => c.id === cardIdToDuplicate);
      if (originalIndex === -1) return;
      
      const cardToDuplicate = deck.card[originalIndex];
      if (!cardToDuplicate) return;

      const isConvertedNeutral = cardToDuplicate.type === CardType.Neutral && cardToDuplicate.originalType === CardType.Basic;

      const allowedDuplicateTypes: CardType[] = [
        CardType.Job,
        CardType.Unique,
        CardType.Neutral,
        CardType.Forbidden,
        CardType.Monster
      ];

      // LOGIC FIX 1 & 2: Allow Unique, but prevent duplicating a copy
      const canDuplicateType = allowedDuplicateTypes.includes(cardToDuplicate.type);
      if (!canDuplicateType || cardToDuplicate.isDuplicate || isConvertedNeutral) return;

      const newCard: Card = {
        ...cardToDuplicate,
        id: deck.nextCardId++,
        name: `${cardToDuplicate.name} (Copy)`,
        isDuplicate: true, // Mark as a duplicate
        originalId: cardToDuplicate.id,
      };
      
      // UX IMPROVEMENT: Insert adjacent to the original
      deck.card.splice(originalIndex + 1, 0, newCard);
      deck.duplicationCount++;
    },

    undoDuplicate(deckId: number, cardIdToUndo: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const cardIndex = deck.card.findIndex(c => c.id === cardIdToUndo);

      const duplicatedInfo = deck.card[cardIndex];
      if (!duplicatedInfo) return;

      if (cardIndex === -1 || !duplicatedInfo.isDuplicate) return;

      deck.card.splice(cardIndex, 1); // Remove the duplicated card from the deck
      deck.duplicationCount--; // Decrement count to refund the sequential cost
    },

    // UPDATED: convertCard action now modifies the new state property
    convertCard(deckId: number, cardId: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const card = deck.card.find(c => c.id === cardId);
      if (card && card.type === CardType.Basic) {
        card.type = CardType.Neutral;
        deck.totalConversionCost += 10; // Add to the permanent cost
      }
    },

    // UPDATED: undoConvertCard action also modifies the new state property
    undoConvertCard(deckId: number, cardId: number) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const card = deck.card.find(c => c.id === cardId);
      if (card && card.type === CardType.Neutral && card.originalType === CardType.Basic) {
        card.type = card.originalType;
        card.epiphany = EpiphanyType.None;
        deck.totalConversionCost -= 10; // Refund the permanent cost
      }
    },

    upgradeCard(deckId: number, cardId: number, epiphanyType: EpiphanyType) {
      const deck = this.decks.find(d => d.id === deckId);
      if (!deck) return;

      const card = deck.card.find(c => c.id === cardId);
      if (!card) return;
      if (card.type === CardType.Basic) return;
      if (epiphanyType === EpiphanyType.Normal && (card.type === CardType.Job || card.type === CardType.Unique)) return;
      card.epiphany = epiphanyType;
    },
  },
});