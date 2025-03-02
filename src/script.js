import Matter from "matter-js";

// Константы
const WIDTH = 300;
const HEIGHT = 600;

const UPPER_BORDER = 100;

// Свойства мячей (радиусы, цвета) вынесены за пределы класса
const BALL_PROPERTIES = [
    { radius: 15, color: "#EA4747" },
    { radius: 22, color: "#EAA147" },
    { radius: 28, color: "#DAEA47" },
    { radius: 34, color: "#96ea47" },
    { radius: 40, color: "#31dd7c" },
    { radius: 46, color: "#47EAC1" },
    { radius: 52, color: "#47B9EA" },
    { radius: 58, color: "#4799ea" },
    { radius: 64, color: "#8347ea" },
    { radius: 70, color: "#E247EA" },
    { radius: 76, color: "#EA4799" },
    { radius: 82, color: "#EA4747" },
    { radius: 88, color: "#EAA147" },
    { radius: 94, color: "#DAEA47" },
    { radius: 100, color: "#96ea47" },
    { radius: 106, color: "#31dd7c" },
    { radius: 112, color: "#47EAC1" },
    { radius: 118, color: "#47B9EA" },
    { radius: 124, color: "#4799ea" },
    { radius: 130, color: "#8347ea" },
    { radius: 136, color: "#E247EA" },
    { radius: 142, color: "#EA4799" },
];

// Настройки Matter.js
let engine = Matter.Engine.create();
Matter.Runner.run(engine);

// Массив для хранения созданных мячей
const balls = [];

// Глобальный индекс для учёта новых мячей
let ballIndex = 1;

// Класс Ball
class Ball {
    constructor(spawnX, spawnY, id, index, spawnTime) {
        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.id = id;
        this.index = index;
        this.spawnTime = spawnTime;
        this.animationTime = 300;
        this.fakeRadius = 0;

        // Инициализируем свойства (радиус, цвет) на основе id
        this.initializeProperties(id);

        // Создаём физическое тело круга из Matter.js
        this.circleBody = Matter.Bodies.circle(
            this.spawnX,
            this.spawnY,
            this.radius,
            this.options
        );

        // Текущее положение
        this.x = this.circleBody.position.x;
        this.y = this.circleBody.position.y;
    }

    // Общие опции для Matter.js
    options = {
        restitution: 0.1,
        friction: 0.1,
        density: 0.001,
    };

    // Установка радиуса и цвета из BALL_PROPERTIES
    initializeProperties(id) {
        const { radius, color } = BALL_PROPERTIES[id];
        this.radius = radius;
        this.color = color;
    }

    // Добавить мяч в мир
    spawn(world) {
        Matter.Composite.add(world, this.circleBody);
    }

    // Удалить мяч из мира
    kill(world) {
        Matter.Composite.remove(world, this.circleBody);
    }

    // Обновление координат
    update() {
        this.x = this.circleBody.position.x;
        this.y = this.circleBody.position.y;
    }

    // Проверка на столкновение с другим мячом
    collidesWith(otherBall) {
        const dx = otherBall.x - this.x;
        const dy = otherBall.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= otherBall.radius + this.radius;
    }

    // Логика при столкновении
    // Решение: передаём управление "снаружи",
    // чтобы класс Ball не зависел от глобальных функций.
    handleCollision(otherBall, spawnTime) {
        if (this.id === otherBall.id) {
            const coords = getMidpoint(this, otherBall);
            const newId = this.id + 1;

            killBall(this.index);
            killBall(otherBall.index);
            spawnBall(coords.x, coords.y, newId, spawnTime);
        }
    }

}

// ============================
// Функции управления шарами
// ============================
function spawnBall(x, y, id, spawnTime) {
    const newBall = new Ball(x, y, id, ballIndex, spawnTime);
    newBall.spawn(engine.world);
    balls[ballIndex] = newBall;
    ballIndex++;
}

function killBall(index) {
    if (!balls[index]) return;
    balls[index].kill(engine.world);
    delete balls[index];
}

// ============================
// Вспомогательные функции
// ============================

// Расчёт "средней точки" между двумя шарами (для спавна нового шара)
function getMidpoint(ballA, ballB) {
    const nx = ballA.x - (ballA.x - ballB.x) / 2;
    const ny = ballA.y - (ballA.y - ballB.y) / 2;
    return {x: nx, y: ny};
}

// "Призрачный" мяч без добавления в массив
function ghostBall(x, y, id) {
    // index можно условно поставить 0 или null
    return new Ball(x, y, id, 0, Date.now());
}

// Генерация весов для случайного выбора id
function generateWeights(n, fixedSize = 11) {
    if (!n || isNaN(n) || n <= 0) {
        n = 1;
    }
    // Всегда размер массива равен fixedSize
    const sequence = new Array(fixedSize).fill(0);

    // a — базовое значение, d — "шаг" уменьшения
    const a = 2 / (n + 1);
    const d = a / n;

    // Перебор до n+1, чтобы покрыть все индексы
    for (let i = 0; i < n + 1; i++) {
        sequence[i] = a - i * d;
    }

    return sequence;
}

// Выбирает id на основе сгенерированных весов
function availableId() {
    const existingBalls = balls.filter((b) => b !== undefined && b !== null);
    let maxId = existingBalls.length > 0 ? Math.max(...existingBalls.map((b) => b.id)) : 0;

    if (maxId < 2) {
        maxId = 2;
    }

    if(maxId > 10) {
        maxId = 10;
    }

    const weights = generateWeights(maxId);

    const randomValue = Math.random();
    let cumulativeWeight = 0;

    for (let id = 0; id < weights.length; id++) {
        cumulativeWeight += weights[id];
        if (randomValue < cumulativeWeight) {
            return id;
        }
    }
    // На случай если сумма весов < 1 (защита от погрешности),
    // возвращаем последний индекс:
    return weights.length - 1;
}

// Ограничение координаты X мыши, чтобы не выходила за край и не "обрезала" мяч
function clampMouseX(mouseX, gball) {
    if (mouseX > WIDTH - gball.radius) return WIDTH - gball.radius;
    if (mouseX < gball.radius) return gball.radius;
    return mouseX;
}

// Конвертация hex-цвета в rgba
function hexToRGBA(hex, alpha = 1) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Простейшая функция плавности для анимаций
function easeOut(t) {
    return t * (2 - t);
}

const ground = Matter.Bodies.rectangle(WIDTH, HEIGHT + 10, 810, 20, { isStatic: true });
const leftWall = Matter.Bodies.rectangle(-10, HEIGHT / 2, 20, HEIGHT, { isStatic: true });
const rightWall = Matter.Bodies.rectangle(WIDTH + 10, HEIGHT / 2, 20, HEIGHT, { isStatic: true });
Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

// Убираем пол
function removeGround() {
    Matter.Composite.remove(engine.world, ground);
}

// Ставим пол
function setGround() {
    Matter.Composite.add(engine.world, ground);
}

// Экспорт
export {
    Ball,
    balls,
    engine,
    spawnBall,
    ghostBall,
    killBall,
    availableId,
    clampMouseX,
    hexToRGBA,
    WIDTH,
    HEIGHT,
    easeOut,
    removeGround,
    setGround,
    UPPER_BORDER,
    getMidpoint,
};
