export const CardType = {
  Basic: 'Basic',
  Job: 'Job',
  Unique: 'Unique',
  Monster: 'Monster',
  Neutral: 'Neutral',
  Forbidden: 'Forbidden'
} as const;

export type CardType = typeof CardType[keyof typeof CardType];

export const EpiphanyType = {
  None: 'None',
  Normal: 'Normal',
  Divine: 'Divine'
} as const;

export type EpiphanyType = typeof EpiphanyType[keyof typeof EpiphanyType];

export interface Card {
  id: number;
  name: string;
  type: CardType; // This now refers to our type alias
  originalType: CardType;
  epiphany: EpiphanyType; // This now refers to our type alias
  isDuplicate?: boolean;
  originalId?: number;
}