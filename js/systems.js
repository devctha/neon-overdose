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
            osc.type = 'sawtooth'; // Som mais agressivo
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(100, t+0.1);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if(type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if(type === 'ui') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if(type === 'coin') { // Som do Código Secreto
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000, t);
            osc.frequency.linearRampToValueAtTime(2000, t+0.2);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t+0.2);
            osc.start(t); osc.stop(t+0.2);
        }
    }
};

const Systems = {
    danteUsed: false,
    checkDevCode() {
        const input = document.getElementById('dev-code');
        const msg = document.getElementById('dev-msg');
        
        if(input.value.toLowerCase() === "dante") {
            if(!this.danteUsed) {
                Shop.addCurrency(10000);
                msg.innerText = "GOD MODE: +10000 CREDITS";
                msg.style.color = "#00ff00";
                AudioSys.play('coin');
                this.danteUsed = true;
            } else {
                msg.innerText = "Não seja tão capitalista assim, não explore o Hijo";
                msg.style.color = "#ff0000";
            }
        } else {
            msg.innerText = "INVALID CODE";
            msg.style.color = "#ff0000";
        }
        input.value = ""; // Limpa campo
    }
};

const Shop = {
    playerData: {
        currency: 0,
        ownedPerks: [1000] // Começa com FORCE MK-1 desbloqueado
    },

    load() {
        const saved = localStorage.getItem('NeonData_V4'); // Versão nova do save
        if(saved) this.playerData = JSON.parse(saved);
        this.updateUI();
    },

    save() {
        localStorage.setItem('NeonData_V4', JSON.stringify(this.playerData));
        this.updateUI();
    },

    updateUI() {
        const elTotal = document.getElementById('total-currency');
        const elShop = document.getElementById('shop-currency');
        if(elTotal) elTotal.innerText = this.playerData.currency;
        if(elShop) elShop.innerText = this.playerData.currency;
    },

    open() {
        document.getElementById('menu-layer').classList.add('hidden');
        document.getElementById('shop-layer').classList.remove('hidden');
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';

        DATA.perks.forEach(perk => {
            const owned = this.playerData.ownedPerks.includes(perk.id);
            
            // LÓGICA DE ÁRVORE:
            // Mostra se já tem OU se tem o requisito
            const reqMet = perk.req === null || this.playerData.ownedPerks.includes(perk.req);
            
            if (!owned && !reqMet) return; // Esconde o card

            const el = document.createElement('div');
            el.className = `shop-card ${owned ? 'owned' : ''}`;
            
            let statusText = `${perk.cost} PTS`;
            let costColor = 'var(--yellow)';

            if(owned) {
                statusText = "DESBLOQUEADO";
                costColor = 'var(--cyan)';
            } else if(this.playerData.currency < perk.cost) {
                statusText = `FALTA ${perk.cost - this.playerData.currency}`;
                costColor = '#555'; // Cinza se não tiver dinheiro
            }

            el.innerHTML = `
                <h3>${perk.name}</h3>
                <p>${perk.desc}</p>
                <div class="cost" style="color:${costColor}">${statusText}</div>
            `;
            
            el.onclick = () => {
                this.buy(perk);
                AudioSys.play('ui');
            };
            grid.appendChild(el);
        });
    },

    close() {
        document.getElementById('shop-layer').classList.add('hidden');
        document.getElementById('menu-layer').classList.remove('hidden');
    },

    buy(perk) {
        if(this.playerData.ownedPerks.includes(perk.id)) return;
        
        if(perk.req !== null && !this.playerData.ownedPerks.includes(perk.req)) {
            alert("Bloqueado! Compre o nível anterior primeiro.");
            return;
        }

        if(this.playerData.currency >= perk.cost) {
            this.playerData.currency -= perk.cost;
            this.playerData.ownedPerks.push(perk.id);
            this.save();
            this.open(); // Refresh UI
        }
    },

    addCurrency(amount) {
        this.playerData.currency += amount;
        this.save();
    }
};

const Resources = {
    toLoad: {
        player: 'img/player.png',
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
                if(this.loaded === this.total) callback();
            };
            
            // Se der erro (arquivo não existe), continua o jogo sem travar
            // O entities.js tem um fallback para desenhar quadrado se a imagem falhar
            img.onerror = () => {
                console.warn(`Imagem não encontrada: ${this.toLoad[key]}`);
                this.loaded++;
                if(this.loaded === this.total) callback();
            };

            this.images[key] = img;
        }
    },

    get(name) {
        // Retorna a imagem apenas se ela carregou com sucesso (width > 0)
        const img = this.images[name];
        return (img && img.complete && img.naturalWidth > 0) ? img : null;
    }
};