import Matter from "matter-js";
import p5 from "p5";

class Ball {
    constructor(spawnX, spawnY, id, index, spawn_time) {
        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.id = id;
        this.index = index;

        this.initializeProperties(); // Устанавливаем radius и color

        this.circleBody = Matter.Bodies.circle(this.spawnX, this.spawnY, this.radius, this.options);
        this.x = this.circleBody.position.x;
        this.y = this.circleBody.position.y;
        this.fake_radius = 0;
        this.spawn_time = spawn_time;
        this.animation_time = 300;
    }

    options = {
        restitution: 0.1,
        friction: 0.05,
        density: 0.001,
    };

    initializeProperties() {

        const properties = {
            0: { radius: 15, color: "#EA4747" },
            1: { radius: 22, color: "#EAA147" },
            2: { radius: 28, color: "#DAEA47" },
            3: { radius: 34, color: "#80EA47" },
            4: { radius: 40, color: "#47EA68" },
            5: { radius: 46, color: "#47EAC1" },
            6: { radius: 52, color: "#47B9EA" },
            7: { radius: 58, color: "#475FEA" },
            8: { radius: 64, color: "#8847EA" },
            9: { radius: 70, color: "#E247EA" },
            10: { radius: 76, color: "#EA4799" }
        };

        const props = properties[this.id];

        this.radius = props.radius;
        this.color = props.color;
    }

    spawn(world) {
        Matter.Composite.add(world, this.circleBody);
    }
    kill(world) {
        Matter.Composite.remove(world, this.circleBody);
    }

    update() {
        this.x = this.circleBody.position.x;
        this.y = this.circleBody.position.y;
    }

    collidesWith(ball) {
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return (distance <= ball.radius + this.radius);
    }

    handleCollision(ball, spawn_time) {
        if (this.id === ball.id) {
            const [x, y] = new_ball_coords(this, ball);
            const id = ball.id + 1;
            kill_ball(this.index);
            kill_ball(ball.index);
            spawn_ball(x, y, id, spawn_time);
        }
    }

}

let engine = Matter.Engine.create();
Matter.Runner.run(engine);

const balls = [];
let ball_index = 1

function generateWeights(n,  fixedSize = 11) {
    if (n === 0 || isNaN(n)) {
        n = 1;
    }

    let a = (2  / (n + 1));
    let d = a / n;

    let sequence = new Array(fixedSize).fill(0);
    for (let i = 0; i < n + 1; i++) {
        sequence[i] = a - i * d;
    }

    return sequence;
}

function available_id() {
    const maxId = balls.length > 0
        ? Math.max(...balls.filter(ball => ball !== undefined && ball !== null).map(ball => ball.id))
        : 0;
    console.log(maxId);

    const weights = generateWeights(maxId);
    let random = Math.random();

    let cumulativeWeight = 0;
    for (let id = 0; id < weights.length; id++) {
        cumulativeWeight += weights[id];
        if(random < cumulativeWeight) {
            return id;
        }
    }
}

function new_ball_coords(ball1, ball2) {
    const x = ball1.x - (ball1.x - ball2.x) / 2;
    const y = ball1.y - (ball1.y - ball2.y) / 2;
    return [x, y];
}

function spawn_ball(x, y, id, spawn_time) {
    let b = new Ball(x, y, id, ball_index, spawn_time);
    b.spawn(engine.world);
    balls[ball_index] = b;
    ball_index++;
}

function kill_ball(index) {
    if (balls[index] === undefined) return;
    balls[index].kill(engine.world);
    delete balls[index];

}

function ghost_ball(x, y, id) {
    return new Ball(x, y, id, 0);
}

const WIDTH = 300;
const HEIGHT = 600;

function fix_mouseX(mouseX, gball) {
    if (mouseX > WIDTH - gball.radius) {return WIDTH - gball.radius}
    if (mouseX < gball.radius) {return gball.radius}
    return mouseX;
}

function hexToRGBA(hex, alpha = 1) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function easeOut(t) { return t * (2 - t); }

export { balls, engine, spawn_ball, ghost_ball, kill_ball, available_id, fix_mouseX, hexToRGBA, WIDTH, HEIGHT, easeOut };