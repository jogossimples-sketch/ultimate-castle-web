const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 400;

let game = {
    gold: 0, wave: 1, hp: 100, maxHp: 100,
    enemies: [], arrows: [],
    heroes: [
        { name: "Gelo", lv: 1, color: "#3498db", type: "slow" },
        { name: "Fogo", lv: 1, color: "#e67e22", type: "aoe" },
        { name: "Veneno", lv: 1, color: "#2ecc71", type: "dot" }
    ]
};

function spawnWave() {
    let count = 5 + (game.wave * 2);
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            game.enemies.push({
                x: canvas.width + (Math.random() * 50),
                y: 315,
                hp: 20 + (game.wave * 10),
                maxHp: 20 + (game.wave * 10),
                speed: 0.8 + (game.wave * 0.02),
                status: "normal",
                reward: 10 + game.wave
            });
        }, i * 800);
    }
}

setInterval(() => {
    if (game.enemies.length > 0) {
        game.heroes.forEach((h, i) => {
            game.arrows.push({
                x: 130, y: 170 + (i * 40),
                dmg: 5 + (h.lv * 2),
                type: h.type,
                color: h.color
            });
        });
    }
}, 1000);

function update() {
    game.enemies.forEach((en, i) => {
        let currentSpeed = en.status === "slow" ? en.speed * 0.4 : en.speed;
        if (en.x > 140) en.x -= currentSpeed;
        else { game.hp -= 0.05; }
        if (en.hp <= 0) {
            game.gold += en.reward;
            game.enemies.splice(i, 1);
        }
    });

    game.arrows.forEach((ar, i) => {
        ar.x += 7;
        if (ar.x > canvas.width) game.arrows.splice(i, 1);
        game.enemies.forEach(en => {
            if (ar.x > en.x && ar.x < en.x + 30) {
                en.hp -= ar.dmg;
                if (ar.type === "slow") en.status = "slow";
                game.arrows.splice(i, 1);
            }
        });
    });

    if (game.enemies.length === 0 && game.hp > 0) {
        game.wave++;
        spawnWave();
    }

    document.getElementById('gold').innerText = Math.floor(game.gold);
    document.getElementById('hp').innerText = Math.max(0, Math.floor(game.hp));
    document.getElementById('wave').innerText = game.wave;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#27ae60"; ctx.fillRect(0, 340, canvas.width, 60);
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(80, 150, 60, 190);
    
    game.heroes.forEach((h, i) => {
        ctx.fillStyle = h.color; ctx.fillRect(95, 165 + (i * 40), 25, 25);
    });

    game.enemies.forEach(en => {
        ctx.fillStyle = en.status === "slow" ? "#87ceeb" : "#c0392b";
        ctx.fillRect(en.x, en.y, 25, 25);
        ctx.fillStyle = "black"; ctx.fillRect(en.x, en.y - 10, 25, 5);
        ctx.fillStyle = "green"; ctx.fillRect(en.x, en.y - 10, (en.hp/en.maxHp)*25, 5);
    });

    game.arrows.forEach(ar => {
        ctx.fillStyle = ar.color; ctx.fillRect(ar.x, ar.y, 12, 4);
    });

    update();
    requestAnimationFrame(draw);
}

window.upgradeHero = (idx) => {
    let cost = 100 * game.heroes[idx].lv;
    if (game.gold >= cost) {
        game.gold -= cost;
        game.heroes[idx].lv++;
    }
};

spawnWave();
draw();
                
