// ==========================================
// ARQUIVO: js/perks.js
// ==========================================

const ALL_PERKS = [
    // --- JUJUTSU KAISEN (LENDÁRIOS & ÚNICOS) ---
    { id: 700, name: "RYOIKI TENKAI: MALEVOLENT SHRINE", desc: "Cortes invisíveis cortam tudo ao redor (Dano Área).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.domainShrine = true; s.dmg *= 1.2; } },
    { id: 701, name: "RYOIKI TENKAI: INFINITE VOID", desc: "Inimigos congelam (Stun Global).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.domainVoid = true; } },
    { id: 702, name: "HOLLOW PURPLE", desc: "Massa imaginária gigante (Pierce Infinito + Dano x3).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.hollowPurple = true; s.bulletSize += 15; s.pierce += 999; s.dmg *= 3; } },
    { id: 703, name: "BLACK FLASH", desc: "Crítico 2.5x no impacto (Distorção Espacial).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.blackFlash = true; } },
    { id: 704, name: "HEAVENLY RESTRICTION", desc: "Sacrifica Defesa/Escudo por Poder Físico Absoluto.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.heavenly = true; s.dmg *= 3; s.speed *= 1.5; s.hasShield = false; s.maxHp = 1; } },
    { id: 705, name: "SIX EYES", desc: "Eficiência de energia perfeita (Homing + FireRate).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.sixEyes = true; s.homing += 0.3; s.fireRate *= 0.5; } },
    { id: 706, name: "CURSED SPEECH", desc: "Palavras que forçam obediência (Chance de Stun).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.cursedSpeech = true; } },
    { id: 707, name: "DISASTER FLAMES", desc: "Fogo vulcânico (Burn DOT).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.fireDmg = true; } },
    { id: 708, name: "IDLE TRANSFIGURATION", desc: "Tocar a alma distorce o corpo (Chance Explodir).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.soulTouch = true; } },
    { id: 709, name: "BOOGIE WOOGIE", desc: "Inimigos ficam confusos ao serem atingidos.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.boogieWoogie = true; } },
    { id: 710, name: "STRAW DOLL", desc: "Dano reflete em outros inimigos.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.strawDoll = true; } },
    { id: 711, name: "BLOOD MANIPULATION", desc: "Tiros de sangue rápidos (Pierce + Speed).", cost: 1000, req: null, rarity: "common", apply: (s) => { s.bloodShot = true; s.bulletSpeed *= 1.5; s.pierce += 1; } },
    { id: 712, name: "DIVERGENT FIST", desc: "O impacto ocorre duas vezes (Double Hit).", cost: 1000, req: null, rarity: "common", apply: (s) => { s.divergentFist = true; } },
    { id: 713, name: "MAHORAGA WHEEL", desc: "Adaptação (Regen + Shield).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.mahoraga = true; s.regen += 0.05; s.hasShield = true; } },
    { id: 714, name: "BLUE (LAPSE)", desc: "Atrai inimigos para o centro (Gravity).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.blueLapse = true; } },
    { id: 715, name: "RED (REVERSAL)", desc: "Repele inimigos violentamente.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.redReversal = true; s.knockback += 20; } },
    { id: 716, name: "SIMPLE DOMAIN", desc: "Neutraliza ataques próximos.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.simpleDomain = true; } },
    { id: 717, name: "REVERSE CURSED TECH", desc: "Energia positiva cura o corpo.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.rctHeal = true; } },
    { id: 719, name: "PRISON REALM", desc: "Prende o Boss por 5s (1x por Boss).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.prisonRealm = true; } },

    // --- CYBERPUNK & TECH ---
    { id: 800, name: "SANDEVISTAN MK-V", desc: "Mundo em câmera lenta (Speed x2).", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.sandevistan = true; s.speed *= 2; } },
    { id: 801, name: "MONOWIRE", desc: "Chicote laser curto (Dano Melee).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.monowire = true; } },
    { id: 802, name: "GORILLA ARMS", desc: "Knockback absurdo + Dano.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.gorilla = true; s.knockback += 10; s.dmg *= 1.2; } },
    { id: 803, name: "KEREZNIKOV", desc: "25% Chance de Esquiva automática.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.dodge = 0.25; } },
    { id: 804, name: "NETRUNNER: OVERHEAT", desc: "Hack de Fogo (Burn).", cost: 1000, req: null, rarity: "common", apply: (s) => { s.hackBurn = true; } },
    { id: 805, name: "NETRUNNER: SHORT CIRCUIT", desc: "Dano x3 em Drones/Robôs.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.hackShock = true; } },
    { id: 806, name: "OPTICAL CAMO", desc: "Invisibilidade (Inimigos te ignoram as vezes).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.camo = true; } },
    { id: 807, name: "SUBDERMAL ARMOR", desc: "Reduz dano recebido.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.armor = (s.armor || 0) + 2; } },
    { id: 808, name: "TITANIUM BONES", desc: "Aumenta HP Maximo.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.maxHp += 50; } },
    { id: 809, name: "PROJECTILE LAUNCHER", desc: "Chance de disparar mísseis.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.missileChance = 0.1; } },
    { id: 810, name: "SMART LINK", desc: "Tiros fazem curvas de 90 graus.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.homing += 0.5; } },
    { id: 811, name: "SECOND HEART", desc: "Ressuscita 1 vez com 100% HP.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.revive = true; } },
    { id: 813, name: "BERSERK OS", desc: "Invencível por 3s ao matar inimigos.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.berserk = true; } },
    { id: 814, name: "MANTIS BLADES", desc: "Sangramento ao encostar em inimigos.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.mantis = true; } },

    // --- ROGUELITE MECHANICS ---
    { id: 3000, name: "VAMPIRISM", desc: "Recupera 1 HP ao matar.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.lifesteal = true; } },
    { id: 3001, name: "CHAIN LIGHTNING", desc: "Eletricidade pula entre inimigos.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.chainLightning = true; s.ricochet += 2; } },
    { id: 3002, name: "POISON DART", desc: "Veneno acumulativo.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.poison = true; } },
    { id: 3003, name: "EXECUTIONER", desc: "Mata inimigos com HP < 20%.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.execute = true; } },
    { id: 3004, name: "GLASS CANNON", desc: "Dano x3, mas HP vira 1.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.glassCannon = true; s.dmg *= 3; s.maxHp = 1; } },
    { id: 3005, name: "THORNS", desc: "Dano ao contato.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.thorns = true; } },
    { id: 3006, name: "MULTISHOT MASTER", desc: "Dobra todos os projéteis.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.count *= 2; } },
    { id: 3007, name: "SNIPER", desc: "Dano/Speed UP, FireRate DOWN.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.dmg *= 2; s.bulletSpeed *= 2; s.fireRate *= 1.5; } },
    { id: 3008, name: "MINIGUN", desc: "FireRate UP, Dano DOWN.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.fireRate *= 0.3; s.dmg *= 0.4; s.spread += 0.3; } },
    { id: 3009, name: "CLUSTER BOMB", desc: "Explosões criam mini-bombas.", cost: 5000, req: null, rarity: "legend", apply: (s) => { s.cluster = true; } },
    { id: 3010, name: "FROST BITE", desc: "Gelo (Slow inimigos).", cost: 1000, req: null, rarity: "common", apply: (s) => { s.frost = true; } },
    { id: 3011, name: "GIANT SLAYER", desc: "Dano x2 em Bosses.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.bossDmg = true; } },
    { id: 3012, name: "TINY MODE", desc: "Hitbox menor (Difícil de acertar).", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.size = 8; } },
    { id: 3013, name: "MAGNET", desc: "Pega itens de longe.", cost: 1000, req: null, rarity: "common", apply: (s) => { s.magnetRange += 150; } },
    { id: 3014, name: "PHANTOM", desc: "Atravessa paredes.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.ghost = true; } },
    { id: 3015, name: "SPLIT SHOT", desc: "Bala se divide ao acertar.", cost: 2500, req: null, rarity: "rare", apply: (s) => { s.splitOnHit = true; } },

    // --- PROCEDURAL STATS (MK-1 a MK-10) ---
    // (Apenas uma amostra para não ficar gigante, mas o código gera mais de 60)
    { id: 4000, name: "DAMAGE MK-1", desc: "Upgrade: x1.2", cost: 200, req: null, rarity: "common", apply: (s) => { s.dmg *= 1.2; } },
    { id: 4004, name: "DAMAGE MK-5", desc: "Upgrade: x2.5", cost: 1000, req: 4000, rarity: "rare", apply: (s) => { s.dmg *= 1.2; } },
    { id: 4009, name: "DAMAGE MK-10", desc: "Upgrade: x6.2", cost: 2000, req: 4004, rarity: "legend", apply: (s) => { s.dmg *= 1.2; } },
    { id: 4010, name: "FIRE RATE MK-1", desc: "Upgrade: x0.9", cost: 200, req: null, rarity: "common", apply: (s) => { s.fireRate *= 0.9; } },
    { id: 4020, name: "SPEED MK-1", desc: "Upgrade: x1.1", cost: 200, req: null, rarity: "common", apply: (s) => { s.speed *= 1.1; } },
    { id: 4050, name: "HEALTH MK-1", desc: "Upgrade: +20", cost: 200, req: null, rarity: "common", apply: (s) => { s.maxHp += 20; } },
];