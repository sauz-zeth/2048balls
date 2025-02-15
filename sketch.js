const circles = [];
function setup() {
    createCanvas(400, 600);
    frameRate(1000)
}
  
  function draw() {
    background(220);

    for(const c of circles) {
        c.update();
        c.edges();
        c.show();
        for(const j of circles) {
            if(c == j) continue;
            c.collide(j);
        }
    }
}