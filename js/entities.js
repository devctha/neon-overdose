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
        this.angle = 0; // Para controlar a rotação do sprite
    }

    update(keys) {
        let dx=0, dy=0;
        if(keys.w) dy--; if(keys.s) dy++; if(keys.a) dx--; if(keys.d) dx++;
        
        // Normaliza diagonal
        if(dx!==0 || dy!==0) {
            const len = Math.hypot(dx,dy);
            this.x += (dx/len)*this.stats.speed;
            this.y += (dy/len)*this.stats.speed;

            // Calcula o ângulo baseado no movimento
            this.angle = Math.atan2(dy, dx);
        } else {
            // Se parado, aponta para cima (ou mantém o último ângulo se preferir)
            if(keys.w || (!keys.s && !keys.a && !keys.d)) this.angle = -Math.PI/2;
        }

        // Limites da tela
        this.x = Math.max(20, Math.min(window.innerWidth-20, this.x));
        this.y = Math.max(20, Math.min(window.innerHeight-20, this.y));

        this.shootTimer++;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotaciona o sprite na direção do movimento. 
        // Adicionamos 90 graus (Math.PI/2) porque o SVG original aponta para cima.
        ctx.rotate(this.angle + Math.PI/2);

        // --- DESENHO DO SPRITE ---
        const img = Resources.get('player');
        if (img) {
            const drawSize = this.size * 3; // Aumenta um pouco para o sprite ficar visível
            // Desenha a imagem centralizada
            ctx.shadowBlur = 15; 
            ctx.shadowColor = '#00f3ff';
            ctx.drawImage(img, -drawSize/2, -drawSize/2, drawSize, drawSize);
        } else {
            // Fallback caso a imagem não carregue (desenha triângulo)
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(10, 15); ctx.lineTo(-10, 15); ctx.fill();
        }

        ctx.restore();

        // Orbitals (Perk: Escudo Giratório)
        if(this.stats.orbitals > 0) {
            const t = Date.now() / 200;
            ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
            ctx.fillStyle = '#fff';
            for(let i=0; i<this.stats.orbitals; i++) {
                const angle = t + (i * (Math.PI*2)/this.stats.orbitals);
                const ox = this.x + Math.cos(angle)*60;
                const oy = this.y + Math.sin(angle)*60;
                ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI*2); ctx.fill();
            }
        }
    }
}

class Enemy extends Entity {
    constructor(isBoss, difficultyMultiplier) {
        super(0, 0, '#f00');
        this.isBoss = isBoss;
        
        // Seleciona dados do Boss ou Inimigo Comum
        let data = isBoss 
            ? DATA.bosses[Math.floor(Math.random() * DATA.bosses.length)]
            : { size: 20, hpMult: 0.1, speed: 2, color: '#f00', name: 'Drone' };

        // Lógica de Spawn (Bordas)
        const side = Math.floor(Math.random()*4);
        const w = window.innerWidth, h = window.innerHeight;
        const pad = 100;
        
        if(side===0) { this.x = Math.random()*w; this.y = -pad; }
        else if(side===1) { this.x = w+pad; this.y = Math.random()*h; }
        else if(side===2) { this.x = Math.random()*w; this.y = h+pad; }
        else { this.x = -pad; this.y = Math.random()*h; }

        // Stats
        this.name = data.name;
        this.size = data.size;
        this.color = data.color; // A cor virá da Fase no game.js, mas mantemos backup aqui
        this.maxHp = (100 * data.hpMult) * difficultyMultiplier;
        this.hp = this.maxHp;
        this.speed = data.speed + (difficultyMultiplier * 0.1);
        this.angle = 0;
    }

    update(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        
        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
        
        // Rotação visual contínua
        this.angle += this.isBoss ? 0.02 : 0.1; 
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // --- DESENHO DO SPRITE ---
        const imgName = this.isBoss ? 'boss' : 'enemy';
        const img = Resources.get(imgName);

        if (img) {
            // Efeito de "Backlight" Neon colorido atrás do sprite preto/branco
            ctx.shadowBlur = this.isBoss ? 40 : 20;
            ctx.shadowColor = this.color;
            
            // Desenha um círculo colorido por baixo para dar a cor da fase
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(0, 0, this.size/1.5, 0, Math.PI*2); ctx.fill();
            
            // Desenha o Sprite por cima
            ctx.globalAlpha = 1.0;
            const drawSize = this.size * 2.5;
            ctx.drawImage(img, -drawSize/2, -drawSize/2, drawSize, drawSize);
        } else {
            // Fallback (Formas Geométricas Antigas) se a imagem falhar
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.arc(0, 0, this.size/2, 0, Math.PI*2); ctx.fill();
        }

        ctx.restore();
    }
}