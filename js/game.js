const Game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    state: 'MENU',
    loop: 1,
    score: 0,
    timer: 10,
    
    player: null,
    enemies: [],
    bullets: [],
    particles: [], // Array para explosões e efeitos
    
    keys: { w:false, a:false, s:false, d:false },
    
    // Variáveis de Efeito Visual
    shake: 0,

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.onkeydown = e => this.keys[e.key.toLowerCase()] = true;
        window.onkeyup = e => this.keys[e.key.toLowerCase()] = false;

        AudioSys.init();
        Shop.load();

        // Só inicia o loop de renderização depois de carregar os Sprites
        Resources.init(() => {
            requestAnimationFrame(() => this.update());
        });
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        document.getElementById('menu-layer').classList.add('hidden');
        document.getElementById('ui-layer').classList.remove('hidden');
        document.getElementById('game-over-layer').classList.add('hidden');
        
        this.player = new Player(this.canvas.width/2, this.canvas.height/2);
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.loop = 0;
        this.score = 0;
        this.shake = 0;
        
        this.startLoop();
        this.state = 'PLAYING';
    },

    startLoop() {
        this.loop++;
        this.timer = 10 + (this.loop * 0.5); // Tempo aumenta levemente a cada loop
        
        // Limpa inimigos menores, mantém apenas o caos do Boss se houver (opcional)
        this.enemies = this.enemies.filter(e => e.isBoss); 
        
        // Update HUD
        document.getElementById('hud-loop').innerText = this.loop;
        
        // --- ATUALIZAÇÃO DO FUNDO 3D (CSS) ---
        const phase = DATA.phases[(this.loop - 1) % DATA.phases.length];
        
        // Converter cor HEX para RGBA para o brilho do grid
        let c = phase.grid.substring(1).split('');
        if(c.length===3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        c= '0x'+c.join('');
        const rgbaColor = `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')}, 0.4)`;

        // Injeta as cores no CSS
        const root = document.documentElement;
        root.style.setProperty('--phase-color', rgbaColor);
        root.style.setProperty('--phase-bg', phase.bg);

        // Lógica de Spawn (Boss a cada 5 loops)
        const isBoss = this.loop % 5 === 0;
        
        if(isBoss) {
            const boss = new Enemy(true, this.loop);
            this.enemies.push(boss);
            document.getElementById('boss-container').classList.remove('hidden');
            document.getElementById('boss-name').innerText = boss.name;
        } else {
            document.getElementById('boss-container').classList.add('hidden');
            // Dificuldade progressiva na quantidade
            const count = 3 + Math.floor(this.loop * 0.8);
            for(let i=0; i<count; i++) this.enemies.push(new Enemy(false, this.loop));
        }
    },

    update() {
        requestAnimationFrame(() => this.update());
        
        // --- LIMPEZA (TRANSPARÊNCIA PARA O 3D) ---
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- SHAKE GLOBAL (Aplica no DIV #game-stage) ---
        const stage = document.getElementById('game-stage');
        if(this.shake > 0) {
            const sx = (Math.random() - 0.5) * this.shake;
            const sy = (Math.random() - 0.5) * this.shake;
            stage.style.transform = `translate(${sx}px, ${sy}px)`; // Treme o mundo todo
            this.shake *= 0.9;
            if(this.shake < 0.5) this.shake = 0;
        } else {
            stage.style.transform = 'none';
        }

        if(this.state !== 'PLAYING') return;

        // --- LÓGICA DO JOGO ---

        // Timer
        this.timer -= 1/60;
        const maxT = 10 + (this.loop * 0.5);
        const pct = Math.max(0, (this.timer / maxT) * 100);
        document.getElementById('timer-bar').style.width = pct + '%';
        document.getElementById('timer-val').innerText = this.timer.toFixed(2) + 's';

        if(this.timer <= 0) {
            this.openPerkSelection();
        }

        // Player
        this.player.update(this.keys);
        this.player.draw(this.ctx);

        // Tiro Automático
        if(this.player.shootTimer >= this.player.stats.fireRate) {
            this.player.shootTimer = 0;
            this.fireBullet();
        }

        // Balas
        this.bullets.forEach((b, i) => {
            b.update();
            b.draw(this.ctx);
            if(b.life <= 0) this.bullets.splice(i, 1);
        });

        // Partículas (Explosões)
        this.particles.forEach((p, i) => {
            p.update();
            p.draw(this.ctx);
            if(p.life <= 0) this.particles.splice(i, 1);
        });

        // Inimigos
        this.enemies.forEach((e, i) => {
            e.update(this.player.x, this.player.y);
            e.draw(this.ctx);

            // Colisão Player (Game Over)
            const distP = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if(distP < e.size/2 + this.player.size) {
                this.gameOver();
            }

            // Colisão Bala-Inimigo
            this.bullets.forEach((b, bi) => {
                const distB = Math.hypot(e.x - b.x, e.y - b.y);
                
                // Hitbox um pouco generosa para ser satisfatório
                if(distB < e.size/2 + b.size + 5) { 
                    
                    // Lógica para evitar dano múltiplo instantâneo (Pierce)
                    if(b.hitList && b.hitList.includes(e)) return;
                    if(!b.hitList) b.hitList = [];
                    b.hitList.push(e);

                    e.hp -= this.player.stats.dmg;
                    e.hitFlash = 2; // Faz inimigo piscar branco
                    
                    // Aplica Knockback (Empurrão)
                    if(this.player.stats.knockback > 0 && !e.isBoss) {
                        const angle = Math.atan2(e.y - b.y, e.x - b.x);
                        const force = this.player.stats.knockback * 5;
                        e.knockbackX = Math.cos(angle) * force;
                        e.knockbackY = Math.sin(angle) * force;
                    }

                    // Verifica Perfuração (Piercing)
                    if(b.pierce > 0) {
                        b.pierce--;
                    } else {
                        this.bullets.splice(bi, 1); // Remove se não tiver piercing
                    }

                    AudioSys.play('hit');
                    
                    // Faísca no impacto
                    this.particles.push(new Particle(b.x, b.y, '#fff', 'debris'));

                    // Morte do Inimigo
                    if(e.hp <= 0 && !e.dead) {
                        e.dead = true;
                        this.enemies.splice(i, 1);
                        this.score += e.isBoss ? 1000 : 100;
                        document.getElementById('hud-score').innerText = this.score;
                        
                        // EFEITOS DE MORTE (JUICE)
                        this.createExplosion(e.x, e.y, e.color, e.isBoss ? 4 : 1);
                        this.shake += e.isBoss ? 20 : 5; // Aumenta a tremedeira

                        if(e.isBoss) {
                            this.score += 5000;
                            this.openPerkSelection(); // Recompensa extra por matar Boss
                        }
                    }
                }
            });
            
            // Atualiza Barra de Vida do Boss
            if(e.isBoss) {
                const hpPct = (e.hp / e.maxHp) * 100;
                document.getElementById('boss-hp').style.width = hpPct + '%';
            }
        });

        // Respawn de inimigos comuns se acabarem (para não ficar vazio)
        const hasBoss = this.enemies.some(e => e.isBoss);
        if(!hasBoss && this.enemies.length < 3) {
             if(Math.random() < 0.05) this.enemies.push(new Enemy(false, this.loop));
        }
    },

    fireBullet() {
        const closest = this.getClosestEnemy();
        let angle = closest 
            ? Math.atan2(closest.y - this.player.y, closest.x - this.player.x)
            : (this.keys.w ? -Math.PI/2 : 0);

        const spawn = (ang) => {
            const s = this.player.stats;
            // Cria a bala usando a classe Bullet (Entities.js)
            this.bullets.push(new Bullet(this.player.x, this.player.y, 
                Math.cos(ang)*s.bulletSpeed, Math.sin(ang)*s.bulletSpeed, 60, s));
        };

        spawn(angle);
        if(this.player.stats.backShot) spawn(angle + Math.PI);
        if(this.player.stats.sideShot) { spawn(angle + Math.PI/2); spawn(angle - Math.PI/2); }
        
        // SEM EFEITOS DE RECUO NA NAVE (Apenas Shake e Som)
        this.shake += Math.min(5, 1 + (this.player.stats.dmg / 50)); 

        AudioSys.play('shoot');
    },

    createExplosion(x, y, color, sizeMultiplier = 1) {
        // Onda de Choque
        this.particles.push(new Particle(x, y, color, 'shockwave'));
        
        // Confetes / Detritos
        const count = 8 * sizeMultiplier;
        for(let i=0; i<count; i++) {
            this.particles.push(new Particle(x, y, color, 'debris'));
        }
    },

    getClosestEnemy() {
        let t = null, min = Infinity;
        this.enemies.forEach(e => {
            const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if(d < min) { min = d; t = e; }
        });
        return t;
    },

    openPerkSelection() {
        this.state = 'PAUSED';
        document.getElementById('perk-layer').classList.remove('hidden');
        const container = document.getElementById('perk-options');
        container.innerHTML = '';

        // Filtra perks que o jogador COMPROU na loja
        const availablePool = DATA.perks.filter(p => Shop.playerData.ownedPerks.includes(p.id));
        
        // Seleciona até 3 aleatórios
        const options = [];
        const pickCount = Math.min(3, availablePool.length);

        // Clona para não afetar o array original
        const tempPool = [...availablePool];

        for(let i=0; i<pickCount; i++) {
            if(tempPool.length === 0) break;
            const rnd = Math.floor(Math.random() * tempPool.length);
            options.push(tempPool[rnd]);
            tempPool.splice(rnd, 1);
        }

        options.forEach(p => {
            const el = document.createElement('div');
            el.className = `perk-card ${p.rarity}`; // Aplica classe de raridade para CSS
            el.innerHTML = `
                <div class="icon">⚡</div>
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
            `;
            el.onclick = () => {
                p.apply(this.player.stats);
                document.getElementById('perk-layer').classList.add('hidden');
                this.state = 'PLAYING';
                this.startLoop(); 
            };
            container.appendChild(el);
        });
        
        if(options.length === 0) {
            document.getElementById('perk-layer').classList.add('hidden');
            this.state = 'PLAYING';
            this.startLoop();
        }
    },

    gameOver() {
        this.state = 'GAMEOVER';
        document.getElementById('ui-layer').classList.add('hidden');
        document.getElementById('game-over-layer').classList.remove('hidden');
        
        document.getElementById('end-score').innerText = this.score;
        document.getElementById('end-loop').innerText = this.loop;
        
        const credits = Math.floor(this.score * 0.1);
        document.getElementById('end-credits').innerText = credits;
        Shop.addCurrency(credits);
    },

    toMenu() {
        document.getElementById('game-over-layer').classList.add('hidden');
        document.getElementById('menu-layer').classList.remove('hidden');
        this.state = 'MENU';
    }
};

// Iniciar
Game.init();