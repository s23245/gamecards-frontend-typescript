export interface Skill {
    id: number;
    name: string;
    manaCost: number;
    damage: number;
    cooldown: number;
    lastUsedRound: number;
    type: string;
    effect: string;
    value: number;
}

export interface Hero {
    id: number;
    name: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    attack: number;
    defense: number;
    attackDamage: number;
    attackSpeed: number;
    mainElement: string;
    imageUrl: string;
    skills: Skill[];
}

export interface HeroUpdate { hero: Hero; attributeChanges: string[]; }
export interface DuelUpdate { user1: string; hero1: Hero; user2: string; hero2: Hero; logs: string[]; }
export interface Card { id: number; name: string; description: string; rarity: string; imageUrl: string; attributes: Record<string, number>; skills: Skill[]; }
export interface PlayerStatus { username: string; hp: number; }

export interface UserProfile { id: number; firstName: string; lastName: string; email: string; username: string; }
export interface AuthResponse { token: string; username: string; }
export interface UsernameUpdateResponse { token: string; user: UserProfile; }

export interface GameSessionData {
    id: string;
    users: string[];
    heroes: Hero[];
    selectedHeroes: Record<string, number>;
    duelStarted: boolean;
    completed: boolean;
    phase: string;
}

export interface DuelState {
    gameId: string;
    phase: string;
    roundNumber: number;
    playerHero: Hero | null;
    opponentHero: Hero | null;
    cards: Card[];
    players: PlayerStatus[];
    selectedCardId: number | null;
    result: string | null;
    gameOver: boolean;
}
