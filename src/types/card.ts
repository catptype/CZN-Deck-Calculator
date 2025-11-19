export enum CardType {
  Basic = 'Basic',
  Job = 'Job',
  Unique = 'Unique',
  Monster = 'Monster',
  Neutral = 'Neutral',
  Forbidden = 'Forbidden'
}

export enum EpiphanyType {
  None = 'None',
  Normal = 'Normal',
  Divine = 'Divine'
}

export interface Card {
  id: number;
  name: string;
  type: CardType;
  originalType: CardType;
  epiphany: EpiphanyType;
  isDuplicate?: boolean;
  originalId?: number;
}