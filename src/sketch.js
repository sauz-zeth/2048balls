import p5 from "p5";
import Matter from "matter-js";
import {
    balls,
    engine,
    spawnBall,
    ghostBall,
    killBall,
    availableId,
    clampMouseX,
    hexToRGBA,
    easeOut,
    WIDTH,
    HEIGHT,
    removeGround,
    setGround,
    UPPER_BORDER,
} from "./script.js";

new p5((p) => {
    // Текущий ID для шара (генерируется по весам)
    let currentId = availableId();
    // Призрачный шар (курсорный "превью-шар")
    let gball = ghostBall(p.mouseX, 0, currentId);

    // Переменные для контроля задержки при коллизиях
    let collisionLastTime = 0;
    const collisionDelay = 150;

    // Переменные для контроля задержки при клике
    let clickLastTime = 0;
    const clickDelay = 400;

    // Флаг, что пол убран
    let isGroundRemoved = false;

    p.setup = function () {
        p.createCanvas(WIDTH, HEIGHT);
    };


    p.draw = function () {
        p.background(51);

        // Тёмная зона сверху (граница)
        p.fill("#222");
        p.noStroke();
        p.rect(0, 0, WIDTH, UPPER_BORDER);

        // Обновляем физический движок
        Matter.Engine.update(engine);
        const mX = clampMouseX(p.mouseX, gball);

        // Отрисовываем "призрачный" шар на позиции мыши
        p.noStroke();
        p.fill(hexToRGBA(gball.color, 0.5));
        p.circle(mX, gball.radius, gball.radius * 2);

        // Обработка клика мыши (создание нового шара)
        function handleRelease() {
            if (p.millis() - clickLastTime >= clickDelay && !isGroundRemoved) {
                spawnBall(mX, gball.radius, currentId, p.millis());
                killBall(0); // Удаляем призрачный шар

                currentId = availableId();
                gball = ghostBall(mX, gball.radius, currentId);

                clickLastTime = p.millis();
            }
        }

        p.mouseReleased = function() {
            handleRelease();
        };

        p.touchEnded = function() {
            handleRelease();
        };


        // Логика и отрисовка "реальных" шаров
        for (let ball of balls) {
            if (!ball) continue;

            // Если шар очень большой, то ты проиграл лошара, в этой игре нельзя победить
            if (ball.id === 20) {
                removeGround();
                isGroundRemoved = true;
            }

            // Обновляем координаты на основе Matter.js
            ball.update();

            // Анимация "вырастания" (с 50% до 100% радиуса)
            const elapsed = p.millis() - ball.spawnTime;
            const progress = p.constrain(elapsed / ball.animationTime, 0, 1);
            ball.fakeRadius = p.lerp(ball.radius * 0.5, ball.radius, easeOut(progress));

            // Проверяем столкновения с шарами такого же ID
            for (let other of balls) {
                if (!other || other === ball) continue;
                if (ball.id !== other.id) continue;

                const enoughTimePassed = p.millis() - collisionLastTime >= collisionDelay;
                if (ball.collidesWith(other)) {
                    // Если коллизия происходит у верхнего края, убираем пол
                    if (other.y <= UPPER_BORDER || ball.y <= UPPER_BORDER) {
                        removeGround();
                        isGroundRemoved = true;
                    }

                    if(enoughTimePassed) {
                        // Разруливаем саму коллизию
                        ball.handleCollision(other, p.millis());
                        collisionLastTime = p.millis();
                    }
                }
            }

            // Рисуем шар
            p.drawingContext.shadowBlur = ball.radius;
            p.drawingContext.shadowColor = hexToRGBA(ball.color, 0.5);

            p.noStroke();
            p.fill(ball.color);
            p.circle(ball.x, ball.y, ball.fakeRadius * 2);

            // Сбрасываем тень после отрисовки
            p.drawingContext.shadowBlur = 0;

            // Удаляем шар, если он "упал" за границу экрана
            if (ball.y > HEIGHT) {
                killBall(ball.index);
            }
        }

        // Если все шары удалены и пол был убран, восстанавливаем пол
        if (balls.every((b) => b === undefined) && isGroundRemoved) {
            // Очищаем массив (на всякий случай)
            balls.length = 0;
            setGround();
            isGroundRemoved = false;
        }
    };
});
