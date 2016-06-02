var Star = function(params) {
  var direction = params.direction || 0;
  var speed = params.speed || 0;
  var width = params.width || 0;
  var height = params.height || 0;

  speed = (Math.random() < .5) ? speed * 1.1 : speed * 0.9;

  var colors = [
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#a89a49', '#a89a49',
    '#9b1d08',
    '#a87337',
    '#012d77'
  ];

  this.x = params.x || 0; // x position
  this.y = params.y || 0; // y position
  this.radius = params.radius || 1;
  // this.color = params.color || '#fff';
  this.color = colors[Math.floor(Math.random() * colors.length)];

  this.vx = Math.cos(direction) * speed; // x velocity
  this.vy = Math.sin(direction) * speed; // y velocity

  this.getSpeed = function() {
    return Math.sqrt((this.vx * this.vx) + (this.vy * this.vy)); // Pythagorean theorem
  }; // getSpeed

  this.setSpeed = function(speed) {
    var heading = this.getHeading();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  }; // getSpeed

  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  }; // getHeading

  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  }; //setHeading

  this.accelerate = function(ax, ay) {
    this.vx += ax;
    this.vy += ay;
  }; // accelerate

  this.update = function() {
    this.x -= this.vx;
    this.y -= this.vy;

    if(this.vy - 0) {
      if(this.y + this.radius > height) {
        this.y = 0;
        //this.x = this.x + (Math.random() < 0.5 ? -1 : 1) * 20;
      }
    }
    else {
      if(this.y + this.radius < 0) {
        this.y = height;
      }
    }
  }; // update
}; // Star
