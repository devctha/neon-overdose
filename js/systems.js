const AudioSys = {
    ctx: null,
    isOn: false,
    
    init() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
    },
    toggle() {
        this.isOn = !this.isOn;
        document.getElementById('audio-state').innerText = this.isOn ? "ON" : "OFF";
        if(this.isOn && this.ctx.state === 'suspended') this.ctx.resume();
    },
    play(type) {
        if(!this.isOn || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const t = this.ctx.currentTime;

        if(type === 'shoot') {
            osc.frequency.setValueAtTime(300, t);
            osc.frequency.exponentialRampToValueAtTime(50, t+0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if(type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        }
    }
};

const Shop = {
    // Dados do jogador persistentes
    playerData: {
        currency: 0,
        ownedPerks: [1] // Começa apenas com Dano Básico
    },

    load() {
        const saved = localStorage.getItem('NeonData');
        if(saved) this.playerData = JSON.parse(saved);
        this.updateUI();
    },

    save() {
        localStorage.setItem('NeonData', JSON.stringify(this.playerData));
        this.updateUI();
    },

    updateUI() {
        document.getElementById('total-currency').innerText = this.playerData.currency;
        document.getElementById('shop-currency').innerText = this.playerData.currency;
    },

    open() {
        document.getElementById('menu-layer').classList.add('hidden');
        document.getElementById('shop-layer').classList.remove('hidden');
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';

        DATA.perks.forEach(perk => {
            const owned = this.playerData.ownedPerks.includes(perk.id);
            const el = document.createElement('div');
            el.className = `shop-card ${owned ? 'owned' : ''}`;
            el.innerHTML = `
                <h3>${perk.name}</h3>
                <p>${perk.desc}</p>
                <div class="cost">${owned ? 'ADQUIRIDO' : perk.cost + ' PTS'}</div>
            `;
            el.onclick = () => this.buy(perk);
            grid.appendChild(el);
        });
    },

    close() {
        document.getElementById('shop-layer').classList.add('hidden');
        document.getElementById('menu-layer').classList.remove('hidden');
    },

    buy(perk) {
        if(this.playerData.ownedPerks.includes(perk.id)) return;
        if(this.playerData.currency >= perk.cost) {
            this.playerData.currency -= perk.cost;
            this.playerData.ownedPerks.push(perk.id);
            this.save();
            this.open(); // Refresh
        } else {
            alert("PONTOS INSUFICIENTES!");
        }
    },

    addCurrency(amount) {
        this.playerData.currency += amount;
        this.save();
    }
};

const Resources = {
    toLoad: {
        player: 'img/player.svg',
        enemy: 'img/enemy.svg',
        boss: 'img/boss.svg'
    },
    images: {},
    loaded: 0,
    total: 0,

    init(callback) {
        this.total = Object.keys(this.toLoad).length;
        
        for(let key in this.toLoad) {
            const img = new Image();
            img.src = this.toLoad[key];
            img.onload = () => {
                this.loaded++;
                console.log(`Imagem carregada: ${key}`);
                if(this.loaded === this.total) {
                    callback(); // Avisa o jogo que tudo carregou
                }
            };
            this.images[key] = img;
        }
    },

    get(name) {
        return this.images[name];
    }
};