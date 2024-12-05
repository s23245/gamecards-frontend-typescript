
export interface Skill {
    id: number;
    name: string;
    manaCost: number;
    damage: number;
    cooldown: number;
    type: string; // "passive" or "active"
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

export interface HeroUpdate {
    hero: Hero;
    attributeChanges: string[];
}

export interface DuelUpdate {
    user1: string;
    hero1: Hero;
    user2: string;
    hero2: Hero;
    logs: string[];
}

export interface Card {
    id: number;
    name: string;
    description: string;
    rarity: string;
    imageUrl: string;
    attributes: { [key: string]: number };
    skills: Skill[];
}

export interface PlayerStatus {
    username: string;
    hp: number;
}