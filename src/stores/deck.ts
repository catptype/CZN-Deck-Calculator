import { defineStore } from 'pinia'
import type { Card } from '@/types/card'
import { CardType, EpiphanyType } from '@/types/card'

const SEQUENTIAL_COSTS = [0, 10, 30, 50, 70]
const getSequentialCost = (count: number): number => {
  if (count < SEQUENTIAL_COSTS.length) {
    return SEQUENTIAL_COSTS[count]!; // Add the "!" at the end to assert that this is not undefined
  }
  return 70
}

let nextCardId = 9

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

export interface DeckState {
  deck: Card[];
  removedDeck: RemovedCardInfo[]; // UPDATED: Now stores more info
  deckTier: number;
  removalCount: number;
  duplicationCount: number;
  basicRemovalPenalty: number;
  totalConversionCost: number;
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
    totalConversionCost: 0,
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

    // --- REWRITTEN COST BREAKDOWN GETTER ---
    costBreakdown(state): BreakdownNode[] {
      const breakdown: BreakdownNode[] = [];

      // --- 1. General Action Costs (not tied to a card) ---
      const actionCosts: BreakdownNode[] = [];
      for (let i = 0; i < state.duplicationCount; i++) {
        actionCosts.push({ label: `Duplication Action #${i + 1}`, cost: getSequentialCost(i) });
      }
      for (let i = 0; i < state.removalCount; i++) {
        actionCosts.push({ label: `Removal Action #${i + 1}`, cost: getSequentialCost(i) });
      }
      if (state.basicRemovalPenalty > 0) {
        actionCosts.push({ label: 'Basic Removal Penalty', cost: state.basicRemovalPenalty });
      }
      if (state.totalConversionCost > 0) {
        actionCosts.push({ label: 'Card Conversion(s)', cost: state.totalConversionCost });
      }
      if (actionCosts.length > 0) {
        breakdown.push({
          label: 'General Actions',
          cost: actionCosts.reduce((sum, item) => sum + item.cost, 0),
          children: actionCosts
        });
      }
      
      // --- 2. Card-Specific Costs (grouped by card) ---
      for (const card of state.deck) {
        const cardCosts: BreakdownNode[] = [];

        // Base cost for added or duplicated cards
        if (card.type === CardType.Monster) cardCosts.push({ label: 'Base Cost', cost: 80 });
        else if (card.type === CardType.Neutral && card.originalType !== CardType.Basic) cardCosts.push({ label: 'Base Cost', cost: 20 });
        else if (card.type === CardType.Forbidden) cardCosts.push({ label: 'Base Cost', cost: 20 });
        
        // Epiphany cost
        if (card.epiphany === EpiphanyType.Normal) cardCosts.push({ label: 'Normal Epiphany', cost: 10 });
        else if (card.epiphany === EpiphanyType.Divine) cardCosts.push({ label: 'Divine Epiphany', cost: 20 });
        
        // If this card has any costs, create a parent node for it
        if (cardCosts.length > 0) {
          breakdown.push({
            label: card.name,
            cost: cardCosts.reduce((sum, item) => sum + item.cost, 0),
            children: cardCosts,
          });
        }
      }

      return breakdown;
    },

    totalCost(state): number {
      // 1. Start with all permanent action-based costs
      let cost = 0;
      for (let i = 0; i < state.removalCount; i++) cost += getSequentialCost(i);
      for (let i = 0; i < state.duplicationCount; i++) cost += getSequentialCost(i);
      cost += state.basicRemovalPenalty;
      cost += state.totalConversionCost; // Add the permanent conversion cost

      // 2. Add costs from cards currently in the deck
      for (const card of state.deck) {
        if (card.type === CardType.Monster) {
          cost += 80;
        } else if (card.type === CardType.Neutral && card.originalType !== CardType.Basic) {
          cost += 20;
        } else if (card.type === CardType.Forbidden) {
          cost += 20;
        }
        
        // Epiphany costs remain the same
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

    resetDeck() {
      this.$reset();
    },

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
      const hasDuplicates = this.deck.some(c => c.originalId === cardIdToUndo);

      if (hasDuplicates) {
          console.warn("Cannot undo adding a card after it has been duplicated.");
          return;
      }

      const cardIndex = this.deck.findIndex(c => c.id === cardIdToUndo);
      if (cardIndex === -1) return;

      const card = this.deck[cardIndex];
      if (!card) return;

      if (card.id <= 8 || card.isDuplicate) return;

      // If all checks pass, perform the action
      this.deck.splice(cardIndex, 1);
    },
    
    removeCard(cardIdToRemove: number) {
      const cardIndex = this.deck.findIndex(c => c.id === cardIdToRemove);
      if (cardIndex === -1) return;
      
      const cardToMove = this.deck[cardIndex];
      if (!cardToMove) return; 
  
      if (cardToMove.type === CardType.Basic) {
        this.basicRemovalPenalty += 20;
      }
      this.removedDeck.push({ card: cardToMove, originalIndex: cardIndex }); // Store as object
      this.deck.splice(cardIndex, 1);
      this.removalCount++;
    },

    undoRemove(cardIdToRestore: number) {
      const removedInfoIndex = this.removedDeck.findIndex(info => info.card.id === cardIdToRestore);
      if (removedInfoIndex === -1) return;

      const removedInfo = this.removedDeck[removedInfoIndex];
      if (!removedInfo) return;

      const { card, originalIndex } = removedInfo;

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
        id: nextCardId++,
        name: `${cardToDuplicate.name} (Copy)`,
        isDuplicate: true, // Mark as a duplicate
        originalId: cardToDuplicate.id,
      };
      
      // UX IMPROVEMENT: Insert adjacent to the original
      this.deck.splice(originalIndex + 1, 0, newCard);
      this.duplicationCount++;
    },

    undoDuplicate(cardIdToUndo: number) {
        const cardIndex = this.deck.findIndex(c => c.id === cardIdToUndo);

        const duplicatedInfo = this.deck[cardIndex];
        if (!duplicatedInfo) return;

        if (cardIndex === -1 || !duplicatedInfo.isDuplicate) return;

        this.deck.splice(cardIndex, 1); // Remove the duplicated card from the deck
        this.duplicationCount--; // Decrement count to refund the sequential cost
    },

    // UPDATED: convertCard action now modifies the new state property
    convertCard(cardId: number) {
      const card = this.deck.find(c => c.id === cardId);
      if (card && card.type === CardType.Basic) {
        card.type = CardType.Neutral;
        this.totalConversionCost += 10; // Add to the permanent cost
      }
    },

    // UPDATED: undoConvertCard action also modifies the new state property
    undoConvertCard(cardId: number) {
      const card = this.deck.find(c => c.id === cardId);
      if (card && card.type === CardType.Neutral && card.originalType === CardType.Basic) {
        card.type = card.originalType;
        card.epiphany = EpiphanyType.None;
        this.totalConversionCost -= 10; // Refund the permanent cost
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