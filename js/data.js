// js/data.js (COMPLETO E ATUALIZADO)

const DATA = {
    // =========================================================================
    // 1. DADOS DE FASES (VISUAL & ATMOSFERA)
    // =========================================================================
    phases: [
        // --- SETOR 0: INITIAL BOOT (Os Clássicos) ---
        { name: "SYSTEM BOOT", bg: "#050505", grid: "#1a1a1a", accent: "#00f3ff" }, 
        { name: "CRIMSON VOID", bg: "#0a0000", grid: "#330000", accent: "#ff0055" }, 
        { name: "MATRIX DATA", bg: "#000a00", grid: "#002200", accent: "#00ff00" }, 
        { name: "DEEP SPACE", bg: "#00000a", grid: "#000033", accent: "#ffffff" }, 
        { name: "SOLAR FLARE", bg: "#0a0500", grid: "#331100", accent: "#ffaa00" }, 
        { name: "SYNTH WAVE", bg: "#0a000a", grid: "#220033", accent: "#aa00ff" }, 
        { name: "GOLDEN AGE", bg: "#050500", grid: "#222200", accent: "#ffd700" }, 
        { name: "TOXIC WASTE", bg: "#000500", grid: "#112200", accent: "#ccff00" }, 
        { name: "GLITCH CITY", bg: "#101010", grid: "#ffffff", accent: "#000000" }, 
        { name: "AQUA MARINE", bg: "#000505", grid: "#002222", accent: "#00ffaa" }, 

        // --- SETOR 1: HEATWAVE (Tons Quentes) ---
        { name: "MAGMA CORE", bg: "#0f0000", grid: "#440000", accent: "#ff3300" },
        { name: "SUNSET BLVD", bg: "#0f0505", grid: "#441111", accent: "#ff7700" },
        { name: "RUSTY YARD", bg: "#0a0500", grid: "#331a00", accent: "#ffaa33" },
        { name: "BLOOD MOON", bg: "#050000", grid: "#220000", accent: "#ff0000" },
        { name: "NEON PEACH", bg: "#0a0505", grid: "#331111", accent: "#ff99aa" },
        { name: "DESERT STORM", bg: "#080602", grid: "#332211", accent: "#eebb00" },
        { name: "LAVA LAMP", bg: "#080004", grid: "#330011", accent: "#ff0066" },
        { name: "INFERNO", bg: "#000000", grid: "#330500", accent: "#ff4400" },
        { name: "MARS DUST", bg: "#0a0404", grid: "#331111", accent: "#ff5555" },
        { name: "COPPER WIRE", bg: "#050200", grid: "#221100", accent: "#ffaa88" },

        // --- SETOR 2: DEEP FREEZE (Tons Frios) ---
        { name: "ICE AGE", bg: "#00050a", grid: "#001133", accent: "#aaddff" },
        { name: "NIGHT SKY", bg: "#00000f", grid: "#000044", accent: "#6666ff" },
        { name: "ABYSSAL", bg: "#000205", grid: "#000a22", accent: "#0044ff" },
        { name: "FROST BITE", bg: "#050a0a", grid: "#113333", accent: "#00ffff" },
        { name: "GHOST SHIP", bg: "#000505", grid: "#001a1a", accent: "#ccffff" },
        { name: "STEEL BLUE", bg: "#020408", grid: "#112233", accent: "#4488cc" },
        { name: "SAPPHIRE", bg: "#000008", grid: "#000033", accent: "#0000ff" },
        { name: "ELECTRIC SEA", bg: "#000508", grid: "#002233", accent: "#00ccff" },
        { name: "MIDNIGHT", bg: "#010103", grid: "#0a0a1a", accent: "#7777aa" },
        { name: "POLAR LIGHT", bg: "#000202", grid: "#001111", accent: "#88ffcc" },

        // --- SETOR 3: BIOHAZARD (Verdes e Ácidos) ---
        { name: "ACID RAIN", bg: "#050a00", grid: "#112200", accent: "#aaff00" },
        { name: "JUNGLE NEON", bg: "#000a00", grid: "#003300", accent: "#00aa00" },
        { name: "RADIOACTIVE", bg: "#020502", grid: "#0a220a", accent: "#00ff66" },
        { name: "EMERALD CITY", bg: "#000804", grid: "#002211", accent: "#00ff99" },
        { name: "SWAMP THING", bg: "#050500", grid: "#1a1a00", accent: "#88aa00" },
        { name: "ALIEN BLOOD", bg: "#000500", grid: "#001100", accent: "#cc00ff" },
        { name: "VIRUS.EXE", bg: "#000000", grid: "#003300", accent: "#00ff00" },
        { name: "MINT CHIP", bg: "#000504", grid: "#00221a", accent: "#00ffcc" },
        { name: "SNAKE EYES", bg: "#020500", grid: "#0a1a00", accent: "#ddff00" },
        { name: "MOSS GROTTO", bg: "#010301", grid: "#0a1a0a", accent: "#558855" },

        // --- SETOR 4: ROYALTY (Roxos e Rosas) ---
        { name: "AMETHYST", bg: "#0a000a", grid: "#330033", accent: "#cc00cc" },
        { name: "HOT PINK", bg: "#0a0005", grid: "#33001a", accent: "#ff00aa" },
        { name: "ULTRA VIOLET", bg: "#05000a", grid: "#1a0033", accent: "#9900ff" },
        { name: "BUBBLEGUM", bg: "#050002", grid: "#220011", accent: "#ff66aa" },
        { name: "NIGHTCLUB", bg: "#020005", grid: "#110022", accent: "#dd00ff" },
        { name: "LOFI BEATS", bg: "#050205", grid: "#1a0a1a", accent: "#ffaaee" },
        { name: "DARK MAGIC", bg: "#020002", grid: "#110011", accent: "#aa00aa" },
        { name: "GRAPE SODA", bg: "#030005", grid: "#110022", accent: "#aa55ff" },
        { name: "ROSE QUARTZ", bg: "#050101", grid: "#220a0a", accent: "#ffaaaa" },
        { name: "PLASMATECH", bg: "#050008", grid: "#1a002a", accent: "#ff00ff" },

        // --- SETOR 5: MONOCHROME (Preto, Branco, Cinza) ---
        { name: "NOIR CITY", bg: "#000000", grid: "#222222", accent: "#ffffff" },
        { name: "CARBON FIBER", bg: "#050505", grid: "#1a1a1a", accent: "#555555" },
        { name: "SILVER LINING", bg: "#101010", grid: "#333333", accent: "#cccccc" },
        { name: "NIGHT VISION", bg: "#000000", grid: "#001100", accent: "#00ff00" },
        { name: "BLUEPRINT", bg: "#000022", grid: "#ffffff", accent: "#ffffff" },
        { name: "OLD TV", bg: "#0a0a0a", grid: "#111111", accent: "#888888" },
        { name: "PAPER", bg: "#cccccc", grid: "#000000", accent: "#000000" },
        { name: "SHADOW REALM", bg: "#000000", grid: "#080808", accent: "#333333" },
        { name: "MOON DUST", bg: "#050505", grid: "#1a1a1a", accent: "#eeeeee" },
        { name: "OBSIDIAN", bg: "#020202", grid: "#0a0a0a", accent: "#6600cc" },

        // --- SETOR 6: EXOTIC (Combinações Ousadas) ---
        { name: "HALLOWEEN", bg: "#050000", grid: "#220000", accent: "#ff6600" },
        { name: "XMAS LIGHTS", bg: "#000500", grid: "#002200", accent: "#ff0000" },
        { name: "LAKERS", bg: "#05000a", grid: "#110033", accent: "#ffaa00" },
        { name: "MIAMI VICE", bg: "#000505", grid: "#002222", accent: "#ff00aa" },
        { name: "BUMBLEBEE", bg: "#050500", grid: "#222200", accent: "#000000" },
        { name: "COTTON CANDY", bg: "#050005", grid: "#220022", accent: "#00ffff" },
        { name: "JOKER", bg: "#050005", grid: "#220022", accent: "#00ff00" },
        { name: "IRON MAN", bg: "#0a0000", grid: "#330000", accent: "#ffdd00" },
        { name: "PORTAL", bg: "#050505", grid: "#1a1a1a", accent: "#ff6600" },
        { name: "IKEA PUNK", bg: "#00000a", grid: "#000033", accent: "#ffff00" },

        // --- SETOR 7: DARKNESS (Fases difíceis de ver) ---
        { name: "VOID WALKER", bg: "#000000", grid: "#050505", accent: "#111111" },
        { name: "ECLIPSE", bg: "#000000", grid: "#0a0a0a", accent: "#ffffff" },
        { name: "DEEP OCEAN", bg: "#000005", grid: "#000011", accent: "#001133" },
        { name: "BLACK HOLE", bg: "#000000", grid: "#000000", accent: "#330033" },
        { name: "DARK MATTER", bg: "#020202", grid: "#050505", accent: "#440044" },
        { name: "NINJA", bg: "#000000", grid: "#080808", accent: "#000000" },
        { name: "FADE OUT", bg: "#050505", grid: "#080808", accent: "#222222" },
        { name: "STATIC", bg: "#0a0a0a", grid: "#111111", accent: "#222222" },
        { name: "DIM LIGHT", bg: "#020200", grid: "#050500", accent: "#111100" },
        { name: "HARD MODE", bg: "#000000", grid: "#000000", accent: "#ff0000" },

        // --- SETOR 8: ELEMENTS (Terra e Natureza Abstrata) ---
        { name: "SANDSTORM", bg: "#0a0805", grid: "#221a11", accent: "#ccaa88" },
        { name: "FOREST FIRE", bg: "#050200", grid: "#110500", accent: "#00ff00" },
        { name: "THUNDER", bg: "#05050a", grid: "#111133", accent: "#ffff00" },
        { name: "CLOUDY", bg: "#0a0a11", grid: "#222233", accent: "#aabbcc" },
        { name: "VOLCANO", bg: "#0a0000", grid: "#330000", accent: "#555555" },
        { name: "RAINBOW", bg: "#000000", grid: "#111111", accent: "#ff00ff" },
        { name: "OIL SPILL", bg: "#000000", grid: "#111111", accent: "#330033" },
        { name: "MINERAL", bg: "#050508", grid: "#111122", accent: "#0088ff" },
        { name: "CANYON", bg: "#0a0402", grid: "#331105", accent: "#ff5522" },
        { name: "TORNADO", bg: "#080808", grid: "#222222", accent: "#556677" },

        // --- SETOR 9: OMEGA (Fases Finais/Épicas) ---
        { name: "FINAL FRONTIER", bg: "#000000", grid: "#111111", accent: "#ffffff" },
        { name: "GOD MODE", bg: "#ffffff", grid: "#eeeeee", accent: "#000000" },
        { name: "SINGULARITY", bg: "#000000", grid: "#110011", accent: "#ff00ff" },
        { name: "EVENT HORIZON", bg: "#000000", grid: "#000000", accent: "#00f3ff" },
        { name: "OMEGA POINT", bg: "#050005", grid: "#220022", accent: "#ffcc00" },
        { name: "ZERO POINT", bg: "#000505", grid: "#002222", accent: "#ff0055" },
        { name: "INFINITE", bg: "#020005", grid: "#0a0022", accent: "#00ff00" },
        { name: "GAME OVER", bg: "#000000", grid: "#330000", accent: "#ff0000" },
        { name: "THE END", bg: "#000000", grid: "#000000", accent: "#ffffff" },
        { name: "REBIRTH", bg: "#000000", grid: "#111111", accent: "#00f3ff" }
    ],

    // =========================================================================
    // 2. BOSSES (INCLUINDO JJK & NOVOS)
    // =========================================================================
    bosses: [
        { name: "THE MONOLITH", shape: "square", size: 80, hpMult: 1, speed: 1, color: "#ff0055" },
        // Referência JJK: Mahoraga (Divine General) - Adaptável e Rápido
        { name: "MAHORAGA", shape: "star", size: 90, hpMult: 2.5, speed: 4, color: "#fff", desc: "Divine General" }, 
        // Referência JJK: Ryomen (Rei das Maldições) - Brutal
        { name: "RYOMEN", shape: "circle", size: 85, hpMult: 2.2, speed: 3, color: "#ff0000", desc: "King of Curses" }, 
        { name: "VOID EMPEROR", shape: "hexagon", size: 120, hpMult: 3.0, speed: 0.5, color: "#8000ff" },
        { name: "SERAPHIM", shape: "triangle", size: 70, hpMult: 1.5, speed: 5, color: "#00f3ff" },
        { name: "OMEGA STAR", shape: "star", size: 100, hpMult: 3.0, speed: 0.3, color: "#ffffff" }
    ],

    // =========================================================================
    // 3. INIMIGOS COMUNS (POOL VARIADO - NOVOS COMPORTAMENTOS)
    // =========================================================================
    enemies: [
        // --- BASE ---
        { name: "Drone", size: 20, speed: 2, color: "#ff0055", hpMult: 0.1, behavior: null },
        { name: "Kamikaze", size: 15, speed: 6, color: "#ffaa00", hpMult: 0.05, behavior: null },
        { name: "Tank", size: 40, speed: 1, color: "#00ff55", hpMult: 0.3, behavior: null }, 
        { name: "Cursed Spirit", size: 25, speed: 3, color: "#4a004a", hpMult: 0.15, behavior: null },
        
        // --- NOVOS INIMIGOS ---
        { name: "NET-SHREDDER", size: 25, speed: 3, color: "#00f3ff", hpMult: 0.15, behavior: 'dashing' }, // Rápido + Dash
        { name: "ABYSSAL ORB", size: 30, speed: 1.5, color: "#4a004a", hpMult: 0.2, behavior: 'gravity' }, // Orbe com atração
        { name: "GLITCH-HOST", size: 35, speed: 2, color: "#ff66aa", hpMult: 0.25, behavior: 'erratic' }, // Teletransporte/Jump
        { name: "TITAN-GUARD", size: 50, hpMult: 0.4, speed: 0.8, color: "#444444", behavior: 'heavy' }, // Lento e Resistente
        { name: "CURSED-EYE", size: 22, hpMult: 0.1, speed: 2.5, color: "#ffd700", behavior: 'ranged' } // Atira de longe (parado)
    ],

    // =========================================================================
    // 4. PERKS (REFERÊNCIA EXTERNA)
    // =========================================================================
    // Garante que ALL_PERKS (do arquivo perks.js) seja carregado.
    // Se perks.js não for carregado, evita crash usando array vazio.
    perks: typeof ALL_PERKS !== 'undefined' ? ALL_PERKS : []
};