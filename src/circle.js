  class Circle {
    constructor(x, y, r, m) {
      this.position = createVector(x, y);
      this.velocity = createVector();
      this.acceleration = createVector(0, 1);
      this.mass = m;
      this.r = r;
    }
    
    update() {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration)
    }
    
    show() {
    stroke(0);
    strokeWeight(2);
    fill(127);
    circle(this.position.x, this.position.y, this.r * 2);
    }

    collide(other) {

        let impactVector = p5.Vector.sub(other.position, this.position);
        let d = impactVector.mag();
        if (d <= this.r + other.r) {
          // Push the particles out so that they are not overlapping
          let overlap = d - (this.r + other.r);
          let dir = impactVector.copy();
          dir.setMag(overlap * 0.5);
          this.position.add(dir);
          other.position.sub(dir);
          
          // Correct the distance!
          d = this.r + other.r;
          impactVector.setMag(d);
          
          let mSum = this.mass + other.mass;
          let vDiff = p5.Vector.sub(other.velocity, this.velocity);
          // Particle A (this)
          let num = vDiff.dot(impactVector);
          let den = mSum * d * d;
          let deltaVA = impactVector.copy();
          deltaVA.mult(2 * other.mass * num / den);
          this.velocity.add(deltaVA);
          // Particle B (other)
          let deltaVB = impactVector.copy();
          deltaVB.mult(-2 * this.mass * num / den);
          other.velocity.add(deltaVB);
        }
      }

    edges() {
      if (this.position.x > width - this.r) {
        this.position.x = width - this.r;
        this.velocity.x *= -0.1;
      } else if (this.position.x < this.r) {
        this.position.x = this.r;
        this.velocity.x *= -0.1;
      }
  
      if (this.position.y > height - this.r) {
        this.position.y = height - this.r;
        this.velocity.y *= -0.1;
      } else if (this.position.y < this.r) {
        this.position.y = this.r;
        this.velocity.y *= -0.1;
      }
      
    }
  }
    //разбить по файлам, перейти в vscode, инициализировать репо
  //добавить класс классов
  //добавить ввод для выбора места сброса шаров
  //добавить коллизию, для себя разобраться как работает
  //добавить логику выбора шара, логику рандома, классификацию
  //добавить соединение шаров
  


  //добавить класс классов
  //добавить ввод для выбора места сброса шаров
  //добавить коллизию, для себя разобраться как работает
  //добавить логику выбора шара, логику рандома, классификацию
  //добавить соединение шаров