  class Circle {
    constructor(x, y, r) {
      this.position = createVector(x, y);
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0.6);
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
  
  //добавить класс классов
  //добавить ввод для выбора места сброса шаров
  //добавить коллизию, для себя разобраться как работает
  //добавить логику выбора шара, логику рандома, классификацию
  //добавить соединение шаров