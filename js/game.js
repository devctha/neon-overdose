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
    particles: [], // Explosões e efeitos
    
    keys: { w:false, a:false, s:false, d:false },
    shake: 0,
    
    // SISTEMA DE ROGUELITE
    activePerks: [], // Lista de IDs que o jogador pegou NESTA partida

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.onkeydown = e => this.keys[e.key.toLowerCase()] = true;
        window.onkeyup = e => this.keys[e.key.toLowerCase()] = false;

        AudioSys.init();
        Shop.load();

        // Só inicia o loop depois de carregar as imagens
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
        
        // RESET TOTAL PARA O INÍCIO DA RUN
        this.player.resetStats(); 
        this.activePerks = []; 

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
        this.timer = 10 + (this.loop * 0.5); // Dificuldade progressiva
        
        // Mantém apenas Bosses vivos, limpa o resto para a nova rodada
        this.enemies = this.enemies.filter(e => e.isBoss); 
        
        document.getElementById('hud-loop').innerText = this.loop;
        
        // ATUALIZA O CSS DO FUNDO 3D
        const phase = DATA.phases[(this.loop - 1) % DATA.phases.length];
        
        // Converte Hex para RGBA para o brilho do grid
        let c = phase.grid.substring(1).split('');
        if(c.length===3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        c= '0x'+c.join('');
        const rgbaColor = `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')}, 0.4)`;

        const root = document.documentElement;
        root.style.setProperty('--phase-color', rgbaColor);
        root.style.setProperty('--phase-bg', phase.bg);

        // SPAWN BOSS OU WAVE
        const isBoss = this.loop % 5 === 0;
        
        if(isBoss) {
            const boss = new Enemy(true, this.loop);
            this.enemies.push(boss);
            document.getElementById('boss-container').classList.remove('hidden');
            document.getElementById('boss-name').innerText = boss.name;
            
            // Efeito sonoro de alerta
            AudioSys.play('ui'); 
        } else {
            document.getElementById('boss-container').classList.add('hidden');
            const count = 3 + Math.floor(this.loop * 0.8);
            for(let i=0; i<count; i++) this.enemies.push(new Enemy(false, this.loop));
        }
    },

    update() {
        requestAnimationFrame(() => this.update());
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- SCREEN SHAKE ---
        const stage = document.getElementById('game-stage');
        if(this.shake > 0) {
            const sx = (Math.random() - 0.5) * this.shake;
            const sy = (Math.random() - 0.5) * this.shake;
            stage.style.transform = `translate(${sx}px, ${sy}px)`;
            this.shake *= 0.9;
            if(this.shake < 0.5) this.shake = 0;
        } else {
            stage.style.transform = 'none';
        }

        if(this.state !== 'PLAYING') return;
        
        // --- NOVO: LÓGICA DE STATUS EFFECTS, REGEN E DOMAINS (JJK) ---
        
        // 1. Regeneração (RCT)
        if (this.player.stats.rctHeal || this.player.stats.regen > 0) {
            let healAmount = (this.player.stats.regen || 0);
            if(this.player.stats.rctHeal) healAmount += 0.05;
            
            if(this.player.hp < this.player.stats.maxHp) {
                this.player.hp = Math.min(this.player.hp + healAmount, this.player.stats.maxHp);
            }
        }
        
        // 2. Sandevistan (Slow Global para Inimigos)
        const globalSpeedMult = this.player.stats.sandevistan ? 0.3 : 1.0;

        // 3. Boss Bar Logic (Antes do inimigo update)
        const activeBoss = this.enemies.find(e => e.isBoss);
        if (activeBoss) {
            document.getElementById('boss-container').classList.remove('hidden');
            const hpPct = Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100);
            document.getElementById('boss-hp').style.width = hpPct + '%';
        } else {
            document.getElementById('boss-container').classList.add('hidden');
        }

        // Timer
        this.timer -= 1/60;
        const maxT = 10 + (this.loop * 0.5);
        const pct = Math.max(0, (this.timer / maxT) * 100);
        document.getElementById('timer-bar').style.width = pct + '%';
        document.getElementById('timer-val').innerText = this.timer.toFixed(2) + 's';

        if(this.timer <= 0) {
            this.openPerkSelection();
        }

        // --- NOVO: LÓGICA GLOBAL DE GRAVIDADE (ABYSSAL ORB) ---
        // Afeta o Player se houver um orbe por perto
        this.enemies.forEach(e => {
            if (e.behavior === 'gravity') {
                const dx = this.player.x - e.x;
                const dy = this.player.y - e.y;
                const dist = Math.hypot(dx, dy);

                const GRAVITY_RANGE = 250; 
                const GRAVITY_FORCE = 0.5;

                if (dist < GRAVITY_RANGE) {
                    const force = GRAVITY_FORCE * (1 - (dist / GRAVITY_RANGE));
                    
                    // Puxa o player para o orbe
                    this.player.x -= (dx / dist) * force;
                    this.player.y -= (dy / dist) * force;

                    // Efeito visual
                    this.particles.push(new Particle(e.x + Math.random()*20 - 10, e.y + Math.random()*20 - 10, e.color, 'debris'));
                }
            }
        });
        // ----------------------------------------------------

        // Updates
        this.player.update(this.keys);
        this.player.draw(this.ctx);

        if(this.player.shootTimer >= this.player.stats.fireRate) {
            this.player.shootTimer = 0;
            this.fireBullet();
        }

        this.bullets.forEach((b, i) => {
            b.update(); b.draw(this.ctx);
            // NOVO: Divisão de tiro
            if(b.life <= 0) this.bullets.splice(i, 1);
        });

        this.particles.forEach((p, i) => {
            p.update(); p.draw(this.ctx);
            if(p.life <= 0) this.particles.splice(i, 1);
        });

        // --- COLISÕES E FÍSICA ---
        this.enemies.forEach((e, i) => {
            
            // NOVO: Aplica status effects DOTs, Slow e Atualiza Comportamento
            e.update(this.player.x, this.player.y, globalSpeedMult); // Passa o multiplicador Sandevistan
            
            // Dano por Segundo (DOTs)
            if(e.poisonStacks > 0) {
                e.hp -= e.poisonStacks * 0.5 * (1/60); // Dano por frame
                if(Math.random() < 0.2) this.particles.push(new Particle(e.x, e.y, '#00ff00', 'debris'));
            }
            if(e.burnTimer > 0) {
                 e.hp -= 5 * (1/60); 
                 e.burnTimer--;
                 if(Math.random() < 0.2) this.particles.push(new Particle(e.x, e.y, '#ff5500', 'debris'));
            }
            
            // NOVO: Lógica de Domain Expansion (Malevolent Shrine)
            if(this.player.stats.domainShrine) {
                 const range = 200;
                 if(Math.hypot(e.x - this.player.x, e.y - this.player.y) < range) {
                     // Dano é aplicado no update do inimigo para garantir consistência
                    e.hp -= this.player.stats.dmg * 0.1 * (1/60); // Dano constante
                    if(this.loop % 10 === 0) this.particles.push(new Particle(e.x, e.y, '#fff', 'debris'));
                 }
            }
            // Lógica de Thorns (Dano de contato)
            if(this.player.stats.thorns) {
                 e.hp -= 2;
            }

            e.draw(this.ctx);

            // 1. Colisão Inimigo -> Player (Morte ou Escudo)
            const distP = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if(distP < e.size/2 + this.player.size) {
                // NOVO: Lógica de Dodge (Kereznikov)
                if(this.player.stats.dodge > 0 && Math.random() < this.player.stats.dodge) {
                    AudioSys.play('ui');
                    e.knockbackX = (e.x - this.player.x) * 5;
                    e.knockbackY = (e.y - this.player.y) * 5;
                    return; 
                }
                
                if(this.player.stats.hasShield) {
                    // DEFESA DO ESCUDO
                    this.player.stats.hasShield = false; 
                    this.createExplosion(this.player.x, this.player.y, '#00ff00', 5);
                    this.shake += 20;
                    
                    this.enemies.forEach(subE => {
                        const angle = Math.atan2(subE.y - this.player.y, subE.x - this.player.x);
                        subE.knockbackX = Math.cos(angle) * 30;
                        subE.knockbackY = Math.sin(angle) * 30;
                    });
                    AudioSys.play('hit'); 
                } else if (this.player.stats.revive) {
                    // NOVO: Second Heart (Revive)
                    this.player.stats.revive = false;
                    this.player.hp = this.player.stats.maxHp;
                    this.createExplosion(this.player.x, this.player.y, '#ff0055', 10);
                    this.shake += 50;
                }
                 else {
                    this.gameOver();
                }
            }

            // 2. Colisão Inimigo -> Orbitais (Dano Constante)
            if(this.player.stats.orbitals > 0) {
                const t = Date.now() / 200;
                const orbitRadius = 60 + Math.min(60, this.player.stats.dmg / 2);
                
                for(let k=0; k<this.player.stats.orbitals; k++) {
                    const angle = t + (k * (Math.PI*2)/this.player.stats.orbitals);
                    const ox = this.player.x + Math.cos(angle) * orbitRadius;
                    const oy = this.player.y + Math.sin(angle) * orbitRadius;
                    
                    if(Math.hypot(e.x - ox, e.y - oy) < e.size/2 + 10) {
                        e.hp -= this.player.stats.dmg * 0.2; 
                        this.particles.push(new Particle(ox, oy, '#fff', 'debris'));
                        
                        e.x += (e.x - this.player.x) * 0.05;
                        e.y += (e.y - this.player.y) * 0.05;
                    }
                }
            }

            // 3. Colisão Inimigo -> Bala
            this.bullets.forEach((b, bi) => {
                const distB = Math.hypot(e.x - b.x, e.y - b.y);
                if(distB < e.size/2 + b.size + 5) { 
                    if(b.hitList && b.hitList.includes(e)) return;
                    if(!b.hitList) b.hitList = [];
                    b.hitList.push(e);

                    let finalDamage = this.player.stats.dmg;

                    // NOVO: BLACK FLASH (Crítico JJK)
                    if (this.player.stats.blackFlash && Math.random() < 0.15) { 
                        finalDamage *= 2.5;
                        this.createExplosion(e.x, e.y, '#ffaa00', 1);
                    }
                    // NOVO: Boss Slayer
                    if (e.isBoss && this.player.stats.bossDmg) finalDamage *= 2;
                    
                    // NOVO: Executioner
                    if (this.player.stats.execute && e.hp < e.maxHp * 0.2 && !e.isBoss) {
                        finalDamage = 99999;
                    }
                    
                    e.hp -= finalDamage;
                    e.hitFlash = 2;
                    
                    // NOVO: Aplica Status Effects no Hit
                    if (this.player.stats.poison) e.poisonStacks = (e.poisonStacks || 0) + 1;
                    if (this.player.stats.fireDmg) e.burnTimer = 60; // 1 segundo
                    if (this.player.stats.frost) e.speed *= 0.95; // Slow

                    // Empurrão (Knockback)
                    if(this.player.stats.knockback > 0 && !e.isBoss) {
                        const angle = Math.atan2(e.y - b.y, e.x - b.x);
                        const force = this.player.stats.knockback * 5;
                        e.knockbackX = Math.cos(angle) * force;
                        e.knockbackY = Math.sin(angle) * force;
                    }

                    // Perfuração
                    if(b.pierce > 0) b.pierce--;
                    // NOVO: Se não for Hollow Purple, a bala morre (Hollow Purple tem pierce infinito)
                    else if(!this.player.stats.hollowPurple) this.bullets.splice(bi, 1);

                    AudioSys.play('hit');
                    this.particles.push(new Particle(b.x, b.y, '#fff', 'debris'));

                    // MORTE
                    if(e.hp <= 0 && !e.dead) {
                        e.dead = true;
                        this.enemies.splice(i, 1);
                        this.score += e.isBoss ? 1000 : 100;
                        document.getElementById('hud-score').innerText = this.score;
                        
                        this.createExplosion(e.x, e.y, e.color, e.isBoss ? 5 : 1);
                        this.shake += e.isBoss ? 20 : 5;

                        // NOVO: Lifesteal
                        if(this.player.stats.lifesteal) {
                             this.player.hp = Math.min(this.player.hp + 5, this.player.stats.maxHp);
                        }

                        // Se tiver explosão em área (Perk)
                        if(this.player.stats.explosive) {
                            this.createExplosion(e.x, e.y, '#ff5500', 3);
                            // Dano em área
                            this.enemies.forEach(subE => {
                                if(Math.hypot(subE.x - e.x, subE.y - e.y) < 150) {
                                    subE.hp -= this.player.stats.dmg;
                                    subE.hitFlash = 2;
                                }
                            });
                        }

                        if(e.isBoss) {
                            this.score += 5000;
                            this.openPerkSelection(); 
                        }
                    }
                }
            });
        });

        // Respawn constante
        const hasBoss = this.enemies.some(e => e.isBoss);
        if(!hasBoss && this.enemies.length < 3) {
             if(Math.random() < 0.05) this.enemies.push(new Enemy(false, this.loop));
        }

        this.ctx.restore();
    },

    fireBullet() {
        const closest = this.getClosestEnemy();
        // Tiro segue a direção do movimento (Nose direction)
        let angle = this.player.angle; 

        // Se tiver Homing, a BALA sai na direção do inimigo
        if(this.player.stats.homing > 0 && closest) {
             angle = Math.atan2(closest.y - this.player.y, closest.x - this.player.x);
        }

        const spawn = (ang) => {
            const s = this.player.stats;
            this.bullets.push(new Bullet(this.player.x, this.player.y, 
                Math.cos(ang)*s.bulletSpeed, Math.sin(ang)*s.bulletSpeed, 60, s));
        };

        spawn(angle); // Tiro principal
        
        if(this.player.stats.backShot) spawn(angle + Math.PI);
        if(this.player.stats.sideShot) { spawn(angle + Math.PI/2); spawn(angle - Math.PI/2); }
        
        // OMNI SHOT (8 direções)
        if(this.player.stats.omniShot) {
            for(let i=0; i<8; i++) spawn(angle + (i * Math.PI/4));
        }
        
        this.shake += Math.min(5, 1 + (this.player.stats.dmg / 50)); 
        AudioSys.play('shoot');
    },

    createExplosion(x, y, color, sizeMultiplier = 1) {
        // Onda de choque
        this.particles.push(new Particle(x, y, color, 'shockwave'));
        // Detritos
        const count = 10 * sizeMultiplier;
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

        // 1. Filtra perks disponíveis (Comprados, Não pegos na run, Requisitos atendidos)
        const availablePool = DATA.perks.filter(p => 
            Shop.playerData.ownedPerks.includes(p.id) && 
            !this.activePerks.includes(p.id) &&
            (p.req === null || this.activePerks.includes(p.req))
        );
        
        // Sorteia 3
        const options = [];
        const pickCount = Math.min(3, availablePool.length);
        const tempPool = [...availablePool]; // Cópia para sortear sem repetir

        for(let i=0; i<pickCount; i++) {
            if(tempPool.length === 0) break;
            const rnd = Math.floor(Math.random() * tempPool.length);
            options.push(tempPool[rnd]);
            tempPool.splice(rnd, 1);
        }

        // Renderiza os Cards
        options.forEach(p => {
            const el = document.createElement('div');
            el.className = `perk-card ${p.rarity}`;
            el.innerHTML = `
                <div class="icon">⚡</div>
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
            `;
            el.onclick = () => {
                p.apply(this.player.stats);
                this.activePerks.push(p.id); // Marca como pego nesta run
                
                document.getElementById('perk-layer').classList.add('hidden');
                this.state = 'PLAYING';
                this.startLoop(); 
            };
            container.appendChild(el);
        });
        
        // Se não tiver mais cartas disponíveis (Deck vazio ou tudo pego)
        if(options.length === 0) {
            document.getElementById('perk-layer').classList.add('hidden');
            this.state = 'PLAYING';
            this.startLoop();
        }
    },

    rerollPerks() {
        // Custa 500 de Score da partida (não dinheiro da loja)
        if(this.score >= 500) {
            this.score -= 500;
            document.getElementById('hud-score').innerText = this.score;
            
            // Toca som e recarrega a seleção
            AudioSys.play('ui');
            this.openPerkSelection();
        } else {
            alert("Score insuficiente! Precisa de 500 pts.");
        }
    },

    gameOver() {
        this.state = 'GAMEOVER';
        document.getElementById('ui-layer').classList.add('hidden');
        document.getElementById('game-over-layer').classList.remove('hidden');
        
        document.getElementById('end-score').innerText = this.score;
        document.getElementById('end-loop').innerText = this.loop;
        
        // Converte Score em Créditos (10%)
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