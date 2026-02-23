const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 400;

let game = {
    gold: parseInt(localStorage.getItem('growGold')) || 0,
    wave: parseInt(localStorage.getItem('growWave')) || 1,
    hp: 100, maxHp: 100,
    enemies: [], arrows: [],
    heroes: [
        { name: "Mago", lv: 1, type: "slow", emoji: "🧙‍♂️", color: "#70a1ff" },
        { name: "Arqueiro", lv: 1, type: "fast", emoji: "🏹", color: "#eccc68" },
        { name: "Guerreiro", lv: 1, type: "power", emoji: "⚔️", color: "#ff4757" }
    ]
};

function saveGame() {
    localStorage.setItem('growGold', game.gold);
    localStorage.setItem('growWave', game.wave);
}

function spawnWave() {
    let count = 5 + (game.wave * 3);
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            let isBoss = game.wave % 5 === 0 && i === count - 1;
            game.enemies.push({
                x: canvas.width + 50, y: 310,
                hp: isBoss ? (100 * game.wave) : (20 + game.wave * 15),
                maxHp: isBoss ? (100 * game.wave) : (20 + game.wave * 15),
                speed: isBoss ? 0.4 : (0.7 + Math.random() * 0.5),
                reward: isBoss ? (50 * game.wave) : (5 + game.wave),
                emoji: isBoss ? "👹" : "💀",
                size: isBoss ? 50 : 30
            });
        }, i * 700);
    }
}

// Sistema de tiro automático por andar
setInterval(() => {
    if (game.enemies.length > 0) {
        game.heroes.forEach((h, i) => {
            game.arrows.push({
                x: 110, y: 160 + (i * 55),
                target: game.enemies[0],
                dmg: 5 + (h.lv * 4),
                color: h.color, speed: 7
            });
        });
    }
}, 1200);

function update() {
    game.enemies.forEach((en, i) => {
        if (en.x > 145) en.x -= en.speed;
        else { game.hp -= 0.1; } // Dano ao castelo
        
        if (en.hp <= 0) {
            game.gold += en.reward;
            game.enemies.splice(i, 1);
            saveGame();
        }
    });

    game.arrows.forEach((ar, i) => {
        ar.x += ar.speed;
        if (ar.x > canvas.width) game.arrows.splice(i, 1);
        game.enemies.forEach(en => {
            if (ar.x > en.x && ar.x < en.x + en.size) {
                en.hp -= ar.dmg;
                game.arrows.splice(i, 1);
            }
        });
    });

    if (game.enemies.length === 0 && game.hp > 0) {
        game.wave++;
        game.hp = game.maxHp; // Recupera vida após onda
        saveGame();
        spawnWave();
    }

    // Atualiza HUD
    document.getElementById('gold').innerText = "💰 " + game.gold;
    document.getElementById('wave').innerText = "Wave " + game.wave;
    document.getElementById('hp-inner').style.width = (game.hp / game.maxHp * 100) + "%";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fundo (Céu e Chão)
    ctx.fillStyle = "#2f3542"; ctx.fillRect(0, 0, canvas.width, 340);
    ctx.fillStyle = "#2ed573"; ctx.fillRect(0, 340, canvas.width, 60);
    
    // Castelo (Dividido em andares)
    ctx.fillStyle = "#57606f"; ctx.fillRect(70, 130, 80, 210);
    ctx.strokeStyle = "#2f3542"; ctx.lineWidth = 2;
    ctx.strokeRect(70, 130, 80, 70); // Andar 1
    ctx.strokeRect(70, 200, 80, 70); // Andar 2
    ctx.strokeRect(70, 270, 80, 70); // Andar 3

    // Heróis nos andares
    game.heroes.forEach((h, i) => {
        ctx.font = "30px Arial";
        ctx.fillText(h.emoji, 95, 175 + (i * 70));
        ctx.font = "12px Arial"; ctx.fillStyle = "white";
        ctx.fillText("Lv."+h.lv, 100, 145 + (i * 70));
    });

    // Inimigos
    game.enemies.forEach(en => {
        ctx.font = en.size + "px Arial";
        ctx.fillText(en.emoji, en.x, en.y + 25);
        // Barra de vida pequena
        ctx.fillStyle = "red"; ctx.fillRect(en.x, en.y - 10, en.size, 4);
        ctx.fillStyle = "green"; ctx.fillRect(en.x, en.y - 10, (en.hp/en.maxHp)*en.size, 4);
    });

    // Flechas/Magias
    game.arrows.forEach(ar => {
        ctx.fillStyle = ar.color; ctx.beginPath();
        ctx.arc(ar.x, ar.y, 5, 0, Math.PI*2); ctx.fill();
    });

    update();
    requestAnimationFrame(draw);
}

window.upgradeHero = (idx) => {
    let cost = 50 + (game.heroes[idx].lv * 50);
    if (game.gold >= cost) {
        game.gold -= cost;
        game.heroes[idx].lv++;
        saveGame();
    } else {
        alert("Falta ouro! Custa: " + cost);
    }
};

spawnWave();
draw();
                    
