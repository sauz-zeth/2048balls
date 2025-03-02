import p5 from "p5";
import Matter from "matter-js";
import {engine, balls, spawn_ball, kill_ball, ghost_ball, available_id, WIDTH, HEIGHT, fix_mouseX, hexToRGBA, easeOut} from "./script.js";


new p5((p) => {
    p.setup = function () {
        p.createCanvas(WIDTH, HEIGHT);

        let ground = Matter.Bodies.rectangle(WIDTH, HEIGHT + 10, 810, 20, { isStatic: true });
        let l_wall = Matter.Bodies.rectangle(-10, HEIGHT / 2, 20, HEIGHT, { isStatic: true });
        let r_wall = Matter.Bodies.rectangle(WIDTH + 10, HEIGHT / 2, 20, HEIGHT, { isStatic: true });

        Matter.Composite.add(engine.world, [ground, r_wall,l_wall]);
    };

    let id = available_id();
    let gball = ghost_ball(p.mouseX, 40, id);

    let lastTime = 0;
    let delay = 150;

    p.draw = function () {
        p.background(51);

        Matter.Engine.update(engine);
        p.fill(255, 0, 0);

        const mX = fix_mouseX(p.mouseX, gball)

        p.noStroke();
        p.fill(hexToRGBA(gball.color, 0.5));
        p.circle(mX, gball.radius, gball.radius * 2);

        p.mouseClicked = function() {
            spawn_ball(mX, gball.radius, id, p.millis());
            kill_ball(0);

            id = available_id();
            gball = ghost_ball(mX, gball.radius, id);
        }

        for (let ball of balls) {
            if (ball === undefined) continue;

            ball.update();

            let elapsed = p.millis() - ball.spawn_time;
            let progress = p.constrain(elapsed / ball.animation_time, 0, 1);

            ball.fake_radius = p.lerp(ball.radius * 0.5, ball.radius, easeOut(progress));

            for (let b of balls) {
                if (b === undefined) continue;
                if(b === ball) continue;
                if (ball.id !== b.id) continue;

                if(ball.collidesWith(b)) {
                    if (p.millis() - lastTime >= delay) {
                        ball.handleCollision(b, p.millis());
                        lastTime = p.millis();
                    }
                }
            }

            p.drawingContext.shadowBlur = ball.radius;
            p.drawingContext.shadowColor = hexToRGBA(ball.color, 0.3)

            p.noStroke()
            p.fill(ball.color);
            p.circle(ball.x, ball.y, ball.fake_radius * 2);

            p.drawingContext.shadowBlur = 0;
        }
    };
});

