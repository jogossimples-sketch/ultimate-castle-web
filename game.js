const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 400;

// Configurações Estilo Grow Castle
let game = {
    gold: 0, wave: 1, hp: 100, maxHp: 100,
    enemies: [], arrows: [], powers: [],
    castleLevel: 1,
    heroes: [
        { name: "Gelo", lv: 1, color: "#3498db", type: "slow", cooldown: 0 },
        { name: "Fogo", lv: 1, color: "#e67e22", type: "aoe", cooldown: 0 },
        { name: "Veneno", lv: 1, color: "#2ecc71", type: "dot", cooldown: 0 }
    ]
};

function spawnWave() {
    let count = 5 + (game.wave * 2);
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            game.enemies.push({
                x: canvas.width + (Math.random() * 100),
                y: 310,
                hp: 20 + (game.wave * 12),
                maxHp: 20 + (game.wave * 12),
                speed: 0.8 + (game.wave * 0.05),
                status: "normal",
                reward: 15 + game.wave
            });
        }, i * 600);
    }
}

// Ataque Automático dos Heróis
setInterval(() => {
    game.heroes.forEach(h => {
        if (game.enemies.length > 0) {
            let target = game.enemies[0];
            game.arrows.push({
                x: 120, y: 180 + (game.heroes.indexOf(h) * 20),
                tx: target.x, ty: target.y,
                dmg: 5 + (h.lv * 3),
                type: h.type,
                color: h.color
            });
        }
    });
}, 1200);

function update() {
    // Lógica de Inimigos
    game.enemies.forEach((en, i) => {
        let currentSpeed = en.status === "slow" ? en.speed * 0.5 : en.speed;
        if (en.x > 140) en.x -= currentSpeed;
        else { game.hp -= 0.1; } // Dano ao castelo

        if (en.hp <= 0) {
            game.gold += en.reward;
            game.enemies.splice(i, 1);
        }
    });

    // Lógica de Projéteis
    game.arrows.forEach((ar, i) => {
        ar.x += 8;
        game.enemies.forEach(en => {
            if (ar.x > en.x && ar.x < en.x + 30) {
                en.hp -= ar.dmg;
                if (ar.type === "slow") en.status = "slow";
                game.arrows.splice(i, 1);
            }
        });
    });

    if (game.enemies.length === 0) { game.wave++; spawnWave(); }
    
    // Atualizar UI
    document.getElementById('gold').innerText = Math.floor(game.gold);
    document.getElementById('hp').innerText = Math.floor(game.hp);
    document.getElementById('wave').innerText = game.wave;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chão e Castelo
    ctx.fillStyle = "#27ae60"; ctx.fillRect(0, 340, canvas.width, 60);
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(80, 150, 60, 190);
    
    // Desenhar Heróis no Castelo
    game.heroes.forEach((h, i) => {
        ctx.fillStyle = h.color;
        ctx.fillRect(90, 160 + (i * 40), 20, 20);
        ctx.fillStyle = "white"; ctx.font = "10px Arial";
        ctx.fillText("Lv."+h.lv, 90, 155 + (i * 40));
    });

    // Inimigos com Barra de Vida
    game.enemies.forEach(en => {
        ctx.fillStyle = en.status === "slow" ? "#87ceeb" : "#c0392b";
        ctx.fillRect(en.x, en.y, 25, 25);
        ctx.fillStyle = "black"; ctx.fillRect(en.x, en.y - 10, 25, 5);
        ctx.fillStyle = "green"; ctx.fillRect(en.x, en.y - 10, (en.hp/en.maxHp)*25, 5);
    });

    // Projéteis
    game.arrows.forEach(ar => {
        ctx.fillStyle = ar.color; ctx.fillRect(ar.x, ar.y, 10, 4);
    });

    update();
    requestAnimationFrame(draw);
}

// Funções Globais para os Botões
window.upgradeHero = (index) => {
    let cost = 100 * game.heroes[index].lv;
    if (game.gold >= cost) {
        game.gold -= cost;
        game.heroes[index].lv++;
        alert(game.heroes[index].name + " subiu para o nível " + game.heroes[index].lv);
    } else { alert("Ouro insuficiente! Custa: " + cost); }
};

spawnWave();
draw();
                    
