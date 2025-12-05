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
        } else if(type === 'ui') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        }
    }
};

const Shop = {
    // Dados do jogador persistentes
    playerData: {
        currency: 0,
        ownedPerks: [1000] // Começa com FORCE MK-1 desbloqueado (ou nenhum)
    },

    load() {
        // Usamos uma chave nova 'NeonData_V3' para resetar saves antigos incompatíveis com a nova árvore
        const saved = localStorage.getItem('NeonData_V3');
        if(saved) this.playerData = JSON.parse(saved);
        this.updateUI();
    },

    save() {
        localStorage.setItem('NeonData_V3', JSON.stringify(this.playerData));
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
            // O Perk só aparece se você tem o requisito (perk anterior) OU se já comprou este perk.
            // Exceção: Perks nível 1 (req: null) sempre aparecem.
            const reqMet = perk.req === null || this.playerData.ownedPerks.includes(perk.req);
            
            if (!owned && !reqMet) return; // Esconde perks avançados bloqueados

            const el = document.createElement('div');
            el.className = `shop-card ${owned ? 'owned' : ''}`;
            
            let statusText = `${perk.cost} PTS`;
            if(owned) statusText = "ADQUIRIDO";
            else if(this.playerData.currency < perk.cost) statusText = `FALTA ${perk.cost - this.playerData.currency}`;

            // Adiciona cor amarela se comprado, ou vermelho se sem saldo (via CSS ou inline)
            const costStyle = owned ? 'color:var(--cyan)' : (this.playerData.currency < perk.cost ? 'color:#555' : 'color:var(--yellow)');

            el.innerHTML = `
                <h3>${perk.name}</h3>
                <p>${perk.desc}</p>
                <div class="cost" style="${costStyle}">${statusText}</div>
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
        
        // Validação dupla de requisito
        if(perk.req !== null && !this.playerData.ownedPerks.includes(perk.req)) {
            alert("Bloqueado! Compre o nível anterior primeiro.");
            return;
        }

        if(this.playerData.currency >= perk.cost) {
            this.playerData.currency -= perk.cost;
            this.playerData.ownedPerks.push(perk.id);
            this.save();
            this.open(); // Refresh imediato na UI da loja
        } else {
            // Feedback visual rápido
            const allCards = document.querySelectorAll('.shop-card');
            // Acha o card clicado (gambiarra visual, idealmente passaríamos o elemento)
            // Aqui apenas um alert ou som de erro serve
            // AudioSys.play('error'); 
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
                if(this.loaded === this.total) {
                    callback();
                }
            };
            
            // Tratamento de erro básico (se não achar a imagem, carrega mesmo assim para não travar)
            img.onerror = () => {
                console.warn(`Imagem não encontrada: ${this.toLoad[key]}`);
                this.loaded++;
                if(this.loaded === this.total) callback();
            };

            this.images[key] = img;
        }
    },

    get(name) {
        return this.images[name];
    }
};