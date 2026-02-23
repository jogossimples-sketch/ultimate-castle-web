const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajuste de tamanho
canvas.width = 800;
canvas.height = 400;

// Estado do Jogo
let gameState = {
    gold: 0,
    wave: 1,
    castleHP: 100,
    maxHP: 100,
    archers: 1,
    enemies: [],
    arrows: []
};

// Configurações do Castelo e Inimigos
const castlePos = { x: 80, y: 150, w: 80, h: 200 };

function spawnWave() {
    for (let i = 0; i < gameState.wave * 3; i++) {
        setTimeout(() => {
            gameState.enemies.push({
                x: canvas.width + (Math.random() * 200),
                y: 320,
                hp: 10 + (gameState.wave * 5),
                speed: 1 + (Math.random() * 0.5),
                reward: 10
            });
        }, i * 800);
    }
}

function shoot() {
    if (gameState.enemies.length > 0) {
        for (let i = 0; i < gameState.archers; i++) {
            setTimeout(() => {
                gameState.arrows.push({
                    x: castlePos.x + 40,
                    y: castlePos.y + 30,
                    vx: 7,
                    vy: (Math.random() - 0.5) * 2
                });
            }, i * 200);
        }
    }
}

// Loop de tiro automático
setInterval(shoot, 1500);

function update() {
    // Atualizar Inimigos
    gameState.enemies.forEach((enemy, index) => {
        if (enemy.x > castlePos.x + castlePos.w) {
            enemy.x -= enemy.speed;
        } else {
            gameState.castleHP -= 0.05; // Dano contínuo ao encostar
        }
    });

    // Atualizar Flechas
    gameState.arrows.forEach((arrow, aIdx) => {
        arrow.x += arrow.vx;
        arrow.y += arrow.vy;

        // Colisão simples
        gameState.enemies.forEach((enemy, eIdx) => {
            if (arrow.x > enemy.x && arrow.x < enemy.x + 30 && arrow.y > enemy.y - 30) {
                enemy.hp -= 10;
                gameState.arrows.splice(aIdx, 1);
                if (enemy.hp <= 0) {
                    gameState.gold += enemy.reward;
                    gameState.enemies.splice(eIdx, 1);
                }
            }
        });
    });

    // Próxima Onda
    if (gameState.enemies.length === 0) {
        gameState.wave++;
        spawnWave();
    }

    // UI
    document.getElementById('gold').innerText = Math.floor(gameState.gold);
    document.getElementById('hp').innerText = Math.max(0, Math.floor(gameState.castleHP));
    document.getElementById('wave').innerText = gameState.wave;

    if (gameState.castleHP <= 0) {
        alert("Castelo Destruído! Recarregue a página.");
        window.location.reload();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chão
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 340, canvas.width, 60);

    // Castelo
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(castlePos.x, castlePos.y, castlePos.w, castlePos.h);
    
    // Arqueiros (representados por pontos azuis no topo)
    ctx.fillStyle = '#3498db';
    for(let i=0; i<gameState.archers; i++) {
        ctx.fillRect(castlePos.x + 10 + (i*10 % 60), castlePos.y + 10, 8, 8);
    }

    // Inimigos
    ctx.fillStyle = '#c0392b';
    gameState.enemies.forEach(e => ctx.fillRect(e.x, e.y, 25, 25));

    // Flechas
    ctx.fillStyle = '#f1c40f';
    gameState.arrows.forEach(a => ctx.fillRect(a.x, a.y, 8, 3));

    update();
    requestAnimationFrame(draw);
}

// Funções de Upgrade
window.upgradeCastle = () => {
    if (gameState.gold >= 50) {
        gameState.gold -= 50;
        gameState.maxHP += 50;
        gameState.castleHP = gameState.maxHP;
    }
};

window.addArcher = () => {
    if (gameState.gold >= 100) {
        gameState.gold -= 100;
        gameState.archers++;
    }
};

spawnWave();
draw();
                          
