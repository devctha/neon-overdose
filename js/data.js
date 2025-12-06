// js/data.js

const DATA = {
    // Fases (Mantenha sua lista de phases coloridas aqui)
    phases: [
        { name: "SYSTEM BOOT", bg: "#050505", grid: "#1a1a1a", accent: "#bc13fe" }, 
        { name: "DOMAIN EXPANSION", bg: "#0a0000", grid: "#330000", accent: "#ff0055" }, 
        // ... (resto das fases)
    ],

    bosses: [
        { name: "THE MONOLITH", shape: "square", size: 80, hpMult: 1, speed: 1, color: "#ff0055" },
        { name: "MAHORAGA", shape: "star", size: 100, hpMult: 2.5, speed: 3, color: "#fff" }, // Boss Novo
        { name: "SUKUNA FINGER", shape: "triangle", size: 60, hpMult: 1.5, speed: 5, color: "#aa00ff" }
    ],

    // Puxa do arquivo novo
    perks: typeof ALL_PERKS !== 'undefined' ? ALL_PERKS : [] 
};