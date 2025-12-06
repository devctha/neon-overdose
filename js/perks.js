// js/perks.js

// --- 1. PERKS DE ANIME (JUJUTSU KAISEN & OTHERS) ---
const ANIME_PERKS = [
    { 
        id: 700, 
        name: "RYOIKI TENKAI: MALEVOLENT SHRINE", 
        desc: "Cria cortes invisíveis ao redor do jogador (Dano em Área).", 
        cost: 10000, 
        rarity: "legend", 
        req: null,
        apply: s => { s.domainShrine = true; s.dmg *= 1.2; } 
    },
    { 
        id: 701, 
        name: "RYOIKI TENKAI: INFINITE VOID", 
        desc: "Inimigos congelam por sobrecarga de informação.", 
        cost: 12000, 
        rarity: "legend", 
        req: null,
        apply: s => { s.domainVoid = true; } 
    },
    { 
        id: 702, 
        name: "HOLLOW PURPLE", 
        desc: "Tiros tornam-se massa imaginária gigante que apaga tudo.", 
        cost: 15000, 
        rarity: "legend", 
        req: null,
        apply: s => { s.hollowPurple = true; s.bulletSize += 10; s.pierce += 100; s.dmg *= 2; } 
    },
    {
        id: 703,
        name: "BLACK FLASH",
        desc: "Crítico garantido que distorce o espaço (Dano x2.5).",
        cost: 8000,
        rarity: "rare",
        req: null,
        apply: s => { s.blackFlash = true; }
    }
];

// --- 2. PERKS PADRÃO (Utilidade e Armas) ---
const STANDARD_PERKS = [
    { id: 100, name: "DOUBLE TAP", desc: "+1 Projétil", cost: 500, req: null, rarity: "common", apply: s => s.count += 1 },
    { id: 101, name: "TRIPLE THREAT", desc: "+2 Projéteis, +Spread", cost: 1500, req: 100, rarity: "rare", apply: s => { s.count += 2; s.spread += 0.1; } },
    { id: 102, name: "SHOTGUN GOD", desc: "+6 Projéteis, Caos", cost: 4000, req: 101, rarity: "legend", apply: s => { s.count += 6; s.spread += 0.5; } },
    
    { id: 200, name: "SMART BULLETS", desc: "Aumenta perseguição dos tiros", cost: 1000, req: null, rarity: "rare", apply: s => s.homing += 0.1 },
    
    { id: 221, name: "GHOST", desc: "Atravessa Paredes", cost: 5000, req: null, rarity: "legend", apply: s => { s.ghost = true; } },
    
    { id: 300, name: "ORBITAL I", desc: "+1 Esfera Defensiva", cost: 1000, req: null, rarity: "rare", apply: s => s.orbitals += 1 },
    { id: 500, name: "NUKE TOUCH", desc: "Explosão Gigante ao matar", cost: 5000, req: null, rarity: "legend", apply: s => { s.explosive = true; s.dmg *= 1.5; } }
];

// --- 3. GERADOR DE STATUS (MK-1 a MK-10) ---
const GENERATED_PERKS = [];
const STAT_TYPES = [
    { name: "FORCE", stat: "dmg", val: 1.5, desc: "Dano Massivo" },
    { name: "TRIGGER", stat: "fireRate", val: 0.85, desc: "Fire Rate" },
    { name: "VELOCITY", stat: "bulletSpeed", val: 1.3, desc: "Vel. Bala" },
    { name: "MASS", stat: "bulletSize", val: 1.4, desc: "Tamanho Bala" },
    { name: "ENGINE", stat: "speed", val: 1, add: 1.5, desc: "Velocidade Nave" }
];

let globalId = 2000;

STAT_TYPES.forEach(type => {
    let previousId = null;
    for(let i=1; i<=10; i++) {
        let rarity = i > 7 ? "legend" : (i > 4 ? "rare" : "common");
        let cost = Math.floor(200 * Math.pow(1.5, i)); 
        let descVal = type.add ? `+${(type.add * i).toFixed(1)}` : `x${Math.pow(type.val, i).toFixed(1)}`;

        GENERATED_PERKS.push({
            id: globalId,
            name: `${type.name} MK-${i}`,
            desc: `${descVal} ${type.desc}`,
            cost: cost,
            req: previousId,
            rarity: rarity,
            apply: s => {
                if(type.add) s[type.stat] += type.add * 2;
                else s[type.stat] *= type.val;
            }
        });
        previousId = globalId;
        globalId++;
    }
});

// Exporta tudo junto
const ALL_PERKS = [...ANIME_PERKS, ...STANDARD_PERKS, ...GENERATED_PERKS];