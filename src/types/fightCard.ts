export interface Bout {
  id: string;
  fighter1: string;
  fighter2: string;
  fighter1Image?: string;
  fighter2Image?: string;
  title?: string;
  type: 'main' | 'co-main' | 'undercard' | 'preliminary';
}

export interface FightCard {
  eventDate: string;
  location: string;
  mainEvent: Bout;
  coMainEvent?: Bout;
  otherBouts: Bout[];
  sponsors: string;
  backgroundImage?: string;
}
