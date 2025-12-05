class Entity {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color; this.dead = false;
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, '#fff');
        this.size = 15;
        this.stats = {
            speed: 5, fireRate: 20, dmg: 10, count: 1, 
            bulletSpeed: 10, bulletSize: 6, spread: 0,
            backShot: false, sideShot: false, homing: 0, ricochet: 0, orbitals: 0, explosive: false
        };
        this.shootTimer = 0;
        this.angle = 0;
    }

    update(keys) {
        let dx=0, dy=0;
        if(keys.w) dy--; if(keys.s) dy++; if(keys.a) dx--; if(keys.d) dx++;
        
        if(dx!==0 || dy!==0) {
            const len = Math.hypot(dx,dy);
            this.x += (dx/len)*this.stats.speed;
            this.y += (dy/len)*this.stats.speed;
            this.angle = Math.atan2(dy, dx);
        }

        // Limites
        this.x = Math.max(20, Math.min(window.innerWidth-20, this.x));
        this.y = Math.max(20, Math.min(window.innerHeight-20, this.y));

        this.shootTimer++;
    }

    draw(ctx) {
        ctx.save();
        
        // --- SEM RECUO: Apenas posiciona onde o jogador está ---
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI/2);

        // --- AURA DE PODER (Mantida, pois é estética estática) ---
        const powerLevel = Math.min(50, this.stats.dmg / 2); 
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 20 + powerLevel; 
        ctx.shadowColor = '#00f3ff';
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath(); 
        ctx.arc(0, 0, (this.size * 1.5) + (powerLevel * 0.5), 0, Math.PI*2); 
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // --- SPRITE ---
        const img = Resources.get('player');
        if (img) {
            const drawSize = this.size * 3.5; 
            ctx.drawImage(img, -drawSize/2, -drawSize/2, drawSize, drawSize);
        } else {
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(10, 15); ctx.lineTo(-10, 15); ctx.fill();
        }

        ctx.restore();

        // Orbitals
        if(this.stats.orbitals > 0) {
            const t = Date.now() / 200;
            ctx.shadowBlur = 15; ctx.shadowColor = '#fff';
            ctx.fillStyle = '#fff';
            for(let i=0; i<this.stats.orbitals; i++) {
                const angle = t + (i * (Math.PI*2)/this.stats.orbitals);
                const ox = this.x + Math.cos(angle)*(60 + powerLevel);
                const oy = this.y + Math.sin(angle)*(60 + powerLevel);
                ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI*2); ctx.fill();
            }
        }
    }
}

class Bullet {
    constructor(x, y, vx, vy, life, stats) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.life = life;
        this.size = stats.bulletSize;
        this.trail = []; 
        this.maxTrail = 5 + Math.floor(stats.bulletSpeed / 2);
    }

    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > this.maxTrail) this.trail.shift();
        this.x += this.vx; 
        this.y += this.vy; 
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        ctx.lineWidth = this.size / 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#00f3ff';
        
        ctx.beginPath();
        if(this.trail.length > 0) ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for(let i=1; i<this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.lineTo(this.x, this.y);
        
        ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff';
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00f3ff';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color, type = 'debris') {
        this.x = x; this.y = y; this.color = color;
        this.type = type;
        
        if (type === 'debris') {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 6 + 2;
            this.vx = Math.cos(ang) * spd;
            this.vy = Math.sin(ang) * spd;
            this.life = 30 + Math.random() * 20;
            this.size = Math.random() * 6 + 2;
            this.friction = 0.92;
        } else if (type === 'shockwave') {
            this.life = 20;
            this.size = 5;
            this.maxSize = 100;
            this.alpha = 1;
        }
    }

    update() {
        if (this.type === 'debris') {
            this.x += this.vx; this.y += this.vy;
            this.vx *= this.friction; this.vy *= this.friction;
            this.life--;
            this.size *= 0.95;
        } else if (this.type === 'shockwave') {
            this.size += (this.maxSize - this.size) * 0.15;
            this.life--;
            this.alpha = this.life / 20;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        if (this.type === 'debris') {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = this.color;
            ctx.globalAlpha = this.life / 40;
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        } else if (this.type === 'shockwave') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

class Enemy extends Entity {
    constructor(isBoss, difficultyMultiplier) {
        super(0, 0, '#f00');
        this.isBoss = isBoss;
        let data = isBoss 
            ? DATA.bosses[Math.floor(Math.random() * DATA.bosses.length)]
            : { size: 20, hpMult: 0.1, speed: 2, color: '#f00', name: 'Drone' };

        const side = Math.floor(Math.random()*4);
        const w = window.innerWidth, h = window.innerHeight;
        const pad = 100;
        if(side===0) { this.x = Math.random()*w; this.y = -pad; }
        else if(side===1) { this.x = w+pad; this.y = Math.random()*h; }
        else if(side===2) { this.x = Math.random()*w; this.y = h+pad; }
        else { this.x = -pad; this.y = Math.random()*h; }

        this.name = data.name;
        this.size = data.size;
        this.color = data.color; 
        this.maxHp = (100 * data.hpMult) * difficultyMultiplier;
        this.hp = this.maxHp;
        this.speed = data.speed + (difficultyMultiplier * 0.1);
        this.angle = 0;
        this.hitFlash = 0;
    }

    update(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
        this.angle += this.isBoss ? 0.02 : 0.1;
        if(this.hitFlash > 0) this.hitFlash--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const imgName = this.isBoss ? 'boss' : 'enemy';
        const img = Resources.get(imgName);

        if (img) {
            ctx.shadowBlur = this.isBoss ? 40 : 20;
            ctx.shadowColor = this.color;
            
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
            ctx.beginPath(); ctx.arc(0, 0, this.size/1.5, 0, Math.PI*2); ctx.fill();
            
            ctx.globalAlpha = 1.0;
            if(this.hitFlash > 0) {
                 ctx.globalCompositeOperation = 'source-atop';
                 ctx.fillStyle = 'white';
            }

            const drawSize = this.size * 2.5;
            ctx.drawImage(img, -drawSize/2, -drawSize/2, drawSize, drawSize);
        } else {
            ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.arc(0, 0, this.size/2, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
}