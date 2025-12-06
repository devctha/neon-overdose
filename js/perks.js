// js/perks.js

const JJK_PERKS = [
    { 
        id: 700, 
        name: "RYOIKI TENKAI: MALEVOLENT SHRINE", 
        desc: "Cria uma área de cortes invisíveis ao redor do player.", 
        cost: 10000, 
        rarity: "legend", 
        req: null,
        type: "domain", // Novo identificador
        apply: s => { s.domainShrine = true; s.dmg *= 1.2; } 
    },
    { 
        id: 701, 
        name: "RYOIKI TENKAI: INFINITE VOID", 
        desc: "Stuna inimigos aleatoriamente com sobrecarga de informação.", 
        cost: 12000, 
        rarity: "legend", 
        req: null,
        type: "domain",
        apply: s => { s.domainVoid = true; } 
    },
    { 
        id: 702, 
        name: "HOLLOW PURPLE", 
        desc: "Tiros têm chance de apagar a existência (Insta-kill + Tamanho gigante).", 
        cost: 15000, 
        rarity: "legend", 
        req: null,
        apply: s => { s.hollowPurple = true; s.bulletSize += 4; } 
    }
];

const STANDARD_PERKS = [
    // Seus perks originais de Double Tap, Ricochet, etc...
    { id: 100, name: "DOUBLE TAP", desc: "+1 Projétil", cost: 500, req: null, rarity: "common", apply: s => s.count += 1 },
    { id: 101, name: "TRIPLE THREAT", desc: "+2 Projéteis, +Spread", cost: 1500, req: 100, rarity: "rare", apply: s => { s.count += 2; s.spread += 0.1; } },
    { id: 221, name: "GHOST", desc: "Atravessa Paredes", cost: 5000, req: null, rarity: "legend", apply: s => { s.ghost = true; } },
    // Adicione o resto aqui...
];

// Gerador de Status (MK-1 até MK-20)
const GENERATED_PERKS = [];
const STAT_TYPES = [
    { name: "FORCE", stat: "dmg", val: 1.5, desc: "Dano" },
    { name: "SPEED", stat: "fireRate", val: 0.85, desc: "Fire Rate" },
];

let pId = 2000;
STAT_TYPES.forEach(t => {
    let lastId = null;
    for(let i=1; i<=10; i++) {
        GENERATED_PERKS.push({
            id: pId,
            name: `${t.name} MK-${i}`,
            desc: `Aumenta ${t.desc}`,
            cost: i * 500,
            req: lastId,
            rarity: i > 7 ? "legend" : (i > 4 ? "rare" : "common"),
            apply: s => { if(t.val < 1) s[t.stat] *= t.val; else s[t.stat] *= t.val; }
        });
        lastId = pId++;
    }
});

// Junta tudo numa variável global
const ALL_PERKS = [...JJK_PERKS, ...STANDARD_PERKS, ...GENERATED_PERKS];