import { defineStore } from 'pinia'
import type { Card } from '@/types/card'
import { CardType, EpiphanyType } from '@/types/card'

const SEQUENTIAL_COSTS = [0, 10, 30, 50, 70]
const getSequentialCost = (count: number): number => {
  if (count < SEQUENTIAL_COSTS.length) {
    return SEQUENTIAL_COSTS[count]
  }
  return 70
}

let nextCardId = 9

// NEW: This interface is for storing removed cards with their original position
interface RemovedCardInfo {
  card: Card;
  originalIndex: number;
}

export interface CostItem {
  label: string;
  cost: number;
}

export interface DeckState {
  deck: Card[];
  removedDeck: RemovedCardInfo[]; // UPDATED: Now stores more info
  deckTier: number;
  removalCount: number;
  duplicationCount: number;
  basicRemovalPenalty: number;
  monsterAddCount: number;
  neutralAddCount: number;
  forbiddenAddCount: number;
}

export const useDeckStore = defineStore('deck', {
  state: (): DeckState => ({
    deck: [
        { id: 1, name: 'Basic Card 1', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
        { id: 2, name: 'Basic Card 2', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
        { id: 3, name: 'Basic Card 3', type: CardType.Basic, originalType: CardType.Basic, epiphany: EpiphanyType.None },
        { id: 4, name: 'Job Card', type: CardType.Job, originalType: CardType.Job, epiphany: EpiphanyType.None },
        { id: 5, name: 'Unique Card 1', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
        { id: 6, name: 'Unique Card 2', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
        { id: 7, name: 'Unique Card 3', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
        { id: 8, name: 'Unique Card 4', type: CardType.Unique, originalType: CardType.Unique, epiphany: EpiphanyType.None },
    ],
    removedDeck: [],
    deckTier: 1,
    removalCount: 0,
    duplicationCount: 0,
    basicRemovalPenalty: 0,
    monsterAddCount: 0,
    neutralAddCount: 0,
    forbiddenAddCount: 0,
  }),

  getters: {
    // No changes to getters, they will work with the new state
    nextRemovalCost: (state) => getSequentialCost(state.removalCount),
    nextDuplicationCost: (state) => getSequentialCost(state.duplicationCount),
    maxCost: (state) => 20 + state.deckTier * 10,

    lastDuplicationCost(state): number {
      if (state.duplicationCount === 0) return 0;
      return getSequentialCost(state.duplicationCount - 1);
    },

    costBreakdown(state): CostItem[] {
      const breakdown: CostItem[] = [];

      // Action Costs
      for (let i = 0; i < state.duplicationCount; i++) {
        breakdown.push({ label: `Duplication #${i + 1}`, cost: getSequentialCost(i) });
      }
      for (let i = 0; i < state.removalCount; i++) {
        breakdown.push({ label: `Removal #${i + 1}`, cost: getSequentialCost(i) });
      }
      if (state.basicRemovalPenalty > 0) {
        breakdown.push({ label: 'Basic Removal Penalty', cost: state.basicRemovalPenalty });
      }

      // Card-Specific Costs (in active deck)
      for (const card of state.deck) {
        // Add cost
        if (card.id > 8 && !card.isDuplicate) {
          if (card.type === CardType.Monster) breakdown.push({ label: `Add: ${card.name}`, cost: 80 });
          if (card.type === CardType.Neutral) breakdown.push({ label: `Add: ${card.name}`, cost: 20 });
          if (card.type === CardType.Forbidden) breakdown.push({ label: `Add: ${card.name}`, cost: 20 });
        }
        // Convert cost
        if (card.type === CardType.Neutral && card.originalType === CardType.Basic) {
          breakdown.push({ label: `Convert: ${card.name}`, cost: 10 });
        }
        // Epiphany cost
        if (card.epiphany === EpiphanyType.Normal) breakdown.push({ label: `N. Epiphany: ${card.name}`, cost: 10 });
        if (card.epiphany === EpiphanyType.Divine) breakdown.push({ label: `D. Epiphany: ${card.name}`, cost: 20 });
      }

      return breakdown;
    },

    totalCost(state): number {
      // 1. Start with action-based costs
      let cost = 0;
      for (let i = 0; i < state.removalCount; i++) cost += getSequentialCost(i);
      for (let i = 0; i < state.duplicationCount; i++) cost += getSequentialCost(i);
      cost += state.basicRemovalPenalty;

      // 2. Add costs from every card currently in the deck based on its properties
      for (const card of state.deck) {
        // Add base cost for card types that have one.
        // This correctly applies to cards added via "Add Card" AND duplicated cards.
        // The original 8 cards have types (Basic, Job, Unique) that are not in this list, so they correctly add 0.
        if (card.type === CardType.Monster) {
          cost += 80;
        } else if (card.type === CardType.Neutral) {
          // Distinguish between a 'natural' Neutral and one that was converted from Basic
          if (card.originalType === CardType.Basic) {
            cost += 10; // Cost for a converted Neutral
          } else {
            cost += 20; // Cost for a natural (added or duplicated) Neutral
          }
        } else if (card.type === CardType.Forbidden) {
          cost += 20;
        }

        // Add cost for any Epiphany upgrades on the card
        if (card.epiphany === EpiphanyType.Normal) {
          cost += 10;
        } else if (card.epiphany === EpiphanyType.Divine) {
          cost += 20;
        }
      }
      return cost;
    },
  },

  actions: {
    setDeckTier(tier: number) {
      if (tier > 0) this.deckTier = tier;
    },
    
    // UPDATED: To handle indexed naming
    addCard(type: CardType) {
      let cardName = `${type} Card`;
      if (type === CardType.Monster) {
        this.monsterAddCount++;
        cardName = `${type} Card ${this.monsterAddCount}`;
      } else if (type === CardType.Neutral) {
        this.neutralAddCount++;
        cardName = `${type} Card ${this.neutralAddCount}`;
      } else if (type === CardType.Forbidden) {
        this.forbiddenAddCount++;
        cardName = `${type} Card ${this.forbiddenAddCount}`;
      }
      
      const newCard: Card = { id: nextCardId++, name: cardName, type, originalType: type, epiphany: EpiphanyType.None };
      this.deck.push(newCard);
    },

    undoAddCard(cardIdToUndo: number) {
        // Double-check the state to ensure no other actions have been taken
        if (this.removalCount > 0 || this.duplicationCount > 0) {
            console.warn("Cannot undo adding a card after other actions have been taken.");
            return;
        }

        const cardIndex = this.deck.findIndex(c => c.id === cardIdToUndo);
        // Ensure card exists, is an "added" card, and not a duplicate
        if (cardIndex === -1 || this.deck[cardIndex].id <= 8 || this.deck[cardIndex].isDuplicate) return;

        // Simply remove the card. The cost is refunded by the reactive totalCost getter.
        this.deck.splice(cardIndex, 1);
    },
    
    removeCard(cardIdToRemove: number) {
      const cardIndex = this.deck.findIndex(c => c.id === cardIdToRemove);
      if (cardIndex === -1) return;
      const cardToMove = this.deck[cardIndex];
      if (cardToMove.type === CardType.Basic) {
        this.basicRemovalPenalty += 20;
      }
      this.removedDeck.push({ card: cardToMove, originalIndex: cardIndex }); // Store as object
      this.deck.splice(cardIndex, 1);
      this.removalCount++;
    },

    // UPDATED: Now uses originalIndex to restore position
    undoRemove(cardIdToRestore: number) {
      const removedInfoIndex = this.removedDeck.findIndex(info => info.card.id === cardIdToRestore);
      if (removedInfoIndex === -1) return;

      const { card, originalIndex } = this.removedDeck[removedInfoIndex];

      if (card.type === CardType.Basic) {
        this.basicRemovalPenalty -= 20;
      }
      this.deck.splice(originalIndex, 0, card); // Splice back into original position
      this.removedDeck.splice(removedInfoIndex, 1);
      this.removalCount--;
    },
    
    // UPDATED: Handles new duplication rules
    duplicateCard(cardIdToDuplicate: number) {
      const originalIndex = this.deck.findIndex(c => c.id === cardIdToDuplicate);
      if (originalIndex === -1) return;
      
      const cardToDuplicate = this.deck[originalIndex];

      // LOGIC FIX 1 & 2: Allow Unique, but prevent duplicating a copy
      const canDuplicateType = [CardType.Job, CardType.Unique, CardType.Neutral, CardType.Forbidden, CardType.Monster].includes(cardToDuplicate.type);
      if (!canDuplicateType || cardToDuplicate.isDuplicate) {
          return;
      }

      const newCard: Card = {
        ...cardToDuplicate,
        id: nextCardId++,
        name: `${cardToDuplicate.name} (Copy)`,
        isDuplicate: true, // Mark as a duplicate
      };
      
      // UX IMPROVEMENT: Insert adjacent to the original
      this.deck.splice(originalIndex + 1, 0, newCard);
      this.duplicationCount++;
    },

    undoDuplicate(cardIdToUndo: number) {
        const cardIndex = this.deck.findIndex(c => c.id === cardIdToUndo);
        // Ensure card exists and is a duplicate before proceeding
        if (cardIndex === -1 || !this.deck[cardIndex].isDuplicate) return;

        this.deck.splice(cardIndex, 1); // Remove the duplicated card from the deck
        this.duplicationCount--; // Decrement count to refund the sequential cost
    },

    // No changes needed for the actions below
    convertCard(cardId: number) {
      const card = this.deck.find(c => c.id === cardId);
      if (card && card.type === CardType.Basic) {
        card.type = CardType.Neutral;
      }
    },

    undoConvertCard(cardId: number) {
      const card = this.deck.find(c => c.id === cardId);
      // Check if the card is a Neutral that was originally a Basic
      if (card && card.type === CardType.Neutral && card.originalType === CardType.Basic) {
        card.type = card.originalType; // Revert to Basic
      }
    },
    
    upgradeCard(cardId: number, epiphanyType: EpiphanyType) {
      const card = this.deck.find(c => c.id === cardId);
      if (!card) return;
      if (card.type === CardType.Basic) return;
      if (epiphanyType === EpiphanyType.Normal && (card.type === CardType.Job || card.type === CardType.Unique)) return;
      card.epiphany = epiphanyType;
    },
  },
});