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
    
    keys: { w:false, a:false, s:false, d:false },


    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.onkeydown = e => this.keys[e.key.toLowerCase()] = true;
        window.onkeyup = e => this.keys[e.key.toLowerCase()] = false;

        AudioSys.init();
        Shop.load();

        // MUDANÇA AQUI: Só inicia o loop depois de carregar as imagens
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
        this.loop = 0;
        this.score = 0;
        
        this.startLoop();
        this.state = 'PLAYING';
    },

    startLoop() {
        this.loop++;
        this.timer = 10 + (this.loop * 0.5); // Tempo aumenta levemente
        this.enemies = []; // Limpa (exceto se quiser manter caos)
        
        // Update HUD
        document.getElementById('hud-loop').innerText = this.loop;
        
        // Background Phase
        const phase = DATA.phases[(this.loop - 1) % DATA.phases.length];
        this.bg = phase.bg;
        this.gridColor = phase.grid;

        // Spawn Logic
        const isBoss = this.loop % 5 === 0;
        
        if(isBoss) {
            const boss = new Enemy(true, this.loop);
            this.enemies.push(boss);
            document.getElementById('boss-container').classList.remove('hidden');
            document.getElementById('boss-name').innerText = boss.name;
        } else {
            document.getElementById('boss-container').classList.add('hidden');
            const count = 3 + Math.floor(this.loop * 0.8);
            for(let i=0; i<count; i++) this.enemies.push(new Enemy(false, this.loop));
        }
    },

    update() {
        requestAnimationFrame(() => this.update());
        
        // Render Background
        this.ctx.fillStyle = this.bg || '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if(this.state !== 'PLAYING') return;

        // Timer Logic
        this.timer -= 1/60;
        const maxT = 10 + (this.loop * 0.5);
        const pct = Math.max(0, (this.timer / maxT) * 100);
        document.getElementById('timer-bar').style.width = pct + '%';
        document.getElementById('timer-val').innerText = this.timer.toFixed(2) + 's';

        if(this.timer <= 0) {
            this.openPerkSelection();
        }

        // Player Logic
        this.player.update(this.keys);
        this.player.draw(this.ctx);

        // Auto Shoot
        if(this.player.shootTimer >= this.player.stats.fireRate) {
            this.player.shootTimer = 0;
            this.fireBullet();
        }

        // Bullets
        this.bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy; b.life--;
            // Draw Bullet
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath(); this.ctx.arc(b.x, b.y, this.player.stats.bulletSize, 0, Math.PI*2); this.ctx.fill();
            
            if(b.life <= 0) this.bullets.splice(i, 1);
        });

        // Enemies
        this.enemies.forEach((e, i) => {
            e.update(this.player.x, this.player.y);
            e.draw(this.ctx);

            // Colisão Player (Game Over)
            const distP = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if(distP < e.size/2 + this.player.size) {
                this.gameOver();
            }

            // Colisão Bala
            this.bullets.forEach((b, bi) => {
                const distB = Math.hypot(e.x - b.x, e.y - b.y);
                if(distB < e.size/2 + 5) { // 5 = bullet radius approx
                    e.hp -= this.player.stats.dmg;
                    this.bullets.splice(bi, 1);
                    AudioSys.play('hit');
                    
                    if(e.hp <= 0 && !e.dead) {
                        e.dead = true;
                        this.enemies.splice(i, 1);
                        this.score += e.isBoss ? 1000 : 100;
                        document.getElementById('hud-score').innerText = this.score;
                        
                        if(e.isBoss) {
                            this.score += 5000; // Bonus Boss
                            this.openPerkSelection(); // Recompensa extra
                        }
                    }
                }
            });
            
            // Boss HP Bar Update
            if(e.isBoss) {
                const hpPct = (e.hp / e.maxHp) * 100;
                document.getElementById('boss-hp').style.width = hpPct + '%';
            }
        });

        // Respawn de inimigos comuns se acabarem (exceto boss)
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
            this.bullets.push({ 
                x: this.player.x, y: this.player.y, 
                vx: Math.cos(ang)*s.bulletSpeed, vy: Math.sin(ang)*s.bulletSpeed,
                life: 60 
            });
        };

        spawn(angle);
        if(this.player.stats.backShot) spawn(angle + Math.PI);
        if(this.player.stats.sideShot) { spawn(angle + Math.PI/2); spawn(angle - Math.PI/2); }
        
        AudioSys.play('shoot');
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
        
        // Seleciona 3 aleatórios
        const options = [];
        for(let i=0; i<3; i++) {
            if(availablePool.length === 0) break;
            const rnd = Math.floor(Math.random() * availablePool.length);
            options.push(availablePool[rnd]);
        }

        options.forEach(p => {
            const el = document.createElement('div');
            el.className = 'perk-card';
            el.innerHTML = `<div class="icon">⚡</div><h3>${p.name}</h3><p>${p.desc}</p>`;
            el.onclick = () => {
                p.apply(this.player.stats);
                document.getElementById('perk-layer').classList.add('hidden');
                this.state = 'PLAYING';
                this.startLoop(); // Próximo loop
            };
            container.appendChild(el);
        });
        
        // Se não tiver perks (deck vazio ou bug), avança direto
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
        
        // Conversão de Score para Créditos da Loja (10% do score)
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