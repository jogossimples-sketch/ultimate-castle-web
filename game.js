const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 400;

let game = {
    gold: parseInt(localStorage.getItem('growGold')) || 0,
    wave: parseInt(localStorage.getItem('growWave')) || 1,
    hp: parseInt(localStorage.getItem('growMaxHp')) || 200,
    maxHp: parseInt(localStorage.getItem('growMaxHp')) || 200,
    castleLv: parseInt(localStorage.getItem('growCastleLv')) || 1,
    enemies: [], arrows: [],
    inBattle: false,
    heroes: [
        { name: "Mago", lv: 1, type: "slow", emoji: "🧙‍♂️", color: "#70a1ff" },
        { name: "Arqueiro", lv: 1, type: "fast", emoji: "🏹", color: "#eccc68" },
        { name: "Guerreiro", lv: 1, type: "power", emoji: "⚔️", color: "#ff4757" }
    ]
};

function saveGame() {
    localStorage.setItem('growGold', game.gold);
    localStorage.setItem('growWave', game.wave);
    localStorage.setItem('growMaxHp', game.maxHp);
    localStorage.setItem('growCastleLv', game.castleLv);
}

function startWave() {
    if (game.inBattle) return;
    game.inBattle = true;
    game.enemies = [];
    let count = 5 + (game.wave * 2);
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            let isBoss = game.wave % 5 === 0 && i === count - 1;
            game.enemies.push({
                x: canvas.width + 50, y: 310,
                hp: isBoss ? (200 * game.wave) : (30 + game.wave * 15),
                maxHp: isBoss ? (200 * game.wave) : (30 + game.wave * 15),
                speed: isBoss ? 0.4 : (0.7 + Math.random() * 0.5),
                reward: 50, // VALOR FIXO DE 50 POR INIMIGO COMO PEDIDO
                emoji: isBoss ? "👹" : "💀",
                size: isBoss ? 55 : 30
            });
        }, i * 700);
    }
}

setInterval(() => {
    if (game.enemies.length > 0) {
        game.heroes.forEach((h, i) => {
            game.arrows.push({
                x: 110, y: 160 + (i * 55),
                dmg: 5 + (h.lv * 5),
                color: h.color, speed: 8
            });
        });
    }
}, 1100);

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

    if (game.inBattle && game.enemies.length === 0 && game.hp > 0) {
        game.inBattle = false;
        game.wave++;
        game.hp = game.maxHp; 
        saveGame();
        setTimeout(startWave, 2000); 
    }

    document.getElementById('gold').innerText = "💰 " + Math.floor(game.gold);
    document.getElementById('wave').innerText = "Wave " + game.wave;
    document.getElementById('hp-inner').style.width = (game.hp / game.maxHp * 100) + "%";

    if (game.hp <= 0) {
        game.hp = game.maxHp;
        game.enemies = [];
        game.inBattle = false;
        startWave();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2f3542"; ctx.fillRect(0, 0, canvas.width, 340);
    ctx.fillStyle = "#2ed573"; ctx.fillRect(0, 340, canvas.width, 60);
    
    // Desenho do Castelo baseado no Level
    ctx.fillStyle = "#57606f"; ctx.fillRect(70, 130, 80, 210);
    ctx.fillStyle = "#a4b0be"; ctx.fillRect(65, 120, 90, 15); // Telhado
    
    game.heroes.forEach((h, i) => {
        ctx.font = "30px Arial";
        ctx.fillText(h.emoji, 95, 175 + (i * 70));
        ctx.font = "12px Arial"; ctx.fillStyle = "white";
        ctx.fillText("Lv."+h.lv, 100, 145 + (i * 70));
    });

    game.enemies.forEach(en => {
        ctx.font = en.size + "px Arial";
        ctx.fillText(en.emoji, en.x, en.y + 25);
        ctx.fillStyle = "red"; ctx.fillRect(en.x, en.y - 10, en.size, 4);
        ctx.fillStyle = "green"; ctx.fillRect(en.x, en.y - 10, (en.hp/en.maxHp)*en.size, 4);
    });

    game.arrows.forEach(ar => {
        ctx.fillStyle = ar.color; ctx.beginPath();
        ctx.arc(ar.x, ar.y, 5, 0, Math.PI*2); ctx.fill();
    });

    update();
    requestAnimationFrame(draw);
}

// BOTÃO UPGRADE HERÓI
window.upgradeHero = (idx) => {
    let cost = 100 + (game.heroes[idx].lv * 100);
    if (game.gold >= cost) {
        game.gold -= cost;
        game.heroes[idx].lv++;
        saveGame();
    }
};

// BOTÃO UPGRADE CASTELO
window.upgradeCastle = () => {
    let cost = game.castleLv * 500;
    if (game.gold >= cost) {
        game.gold -= cost;
        game.castleLv++;
        game.maxHp += 100;
        game.hp = game.maxHp;
        saveGame();
        alert("Castelo Level " + game.castleLv + "! Vida aumentada.");
    } else {
        alert("Ouro insuficiente para o Castelo! Custa: " + cost);
    }
};

startWave();
draw();
        
