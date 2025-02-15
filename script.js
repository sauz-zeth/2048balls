function mouseClicked() {
    r = 5 + Math.random() * 50;
    m = r;
    circles.push(new Circle(mouseX, 2*r + 10, r, m))
}