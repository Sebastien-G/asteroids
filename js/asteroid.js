'use strict';

var Asteroid = function(params) {

  var angle = params.angle || 0;
  var direction = params.direction || 0;
  var speed = params.speed || 0;
  var shapes = [];

  this.angle = angle;
  this.hq = params.hq || false; // x position
  this.x = params.x || 0; // x position
  this.y = params.y || 0; // y position
  this.hitPoints = 3;
  this.size = params.size || 1;
  this.points = params.points || 1000;
  this.splitInto = params.splitInto || 2;
  this.bonus = params.bonus || '';

  switch(this.size) {
    case 1:
      this.hitPoints = 3;
      break;

    case 2:
      this.hitPoints = 2;
      break;

    case 3:
      this.hitPoints = 1;
      break;
  }

  var rotationDirection = Math.random() < 0.5 ? -1 : 1;
  this.rotationSpeed = utils.getRandomArbitrary(0.005, 0.02) * rotationDirection;
  this.vx = Math.cos(direction) * speed; // x velocity
  this.vy = Math.sin(direction) * speed; // y velocity
  this.destroyed = false;

  this.hexColor = '#0f9';
  this.rgbaColor = 'rgba(0, 255, 128, .75)';

  var shape1 = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
    ],
    offset: [
      { x: 90, y: 0},
      { x: 70, y: 60},
      { x: 0, y: 80},
      { x: -20, y: 60},
      { x: -50, y: 40},
      { x: -70, y: 0},
      { x: -40, y: -50},
      { x: 0, y: -70},
      { x: 50, y: -50},
    ]
  };

  var shape2 = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: [
      { x: 70, y: -30},
      { x: 90, y: 20},
      { x: 80, y: 40},
      { x: 60, y: 60},
      { x: -10, y: 70},
      { x: -70, y: 20},
      { x: -70, y: -20},
      { x: -30, y: -80},
      { x: 20, y: -60},
      { x: 20, y: -20}
    ]
  };

  var shape3 = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: [
      { x: 80, y: 0},
      { x: 40, y: 40},
      { x: 40, y: 80},
      { x: 0, y: 80},
      { x: -60, y: 60},
      { x: -70, y: 40},
      { x: -80, y: 0},
      { x: -40, y: -50},
      { x: 30, y: -70},
      { x: 40, y: -40},
      { x: 80, y: -40}
    ]
  };

  var shape4 = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: [
      {x: 80, y: 0},
      {x: 80, y: 60},
      {x: 20, y: 80},
      {x: -20, y: 80},
      {x: -60, y: 60},
      {x: -60, y: 40},
      {x: -40, y: 20},
      {x: -60, y: 0},
      {x: -30, y: -40},
      {x: -20, y: -40},
      {x: 0, y: -60},
      {x: 40, y: -60}
    ]
  };

  var shape5 = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: [
      { x: 40, y: 0},
      { x: 20, y: 20},
      { x: -20, y: 20},
      { x: -20, y: -20},
      { x: 20, y: -20}
    ]
  };

  shapes.push(shape1, shape2, shape3, shape4); //
  this.shape = shapes[Math.floor(Math.random() * shapes.length)];

  if(this.size > 1) {
    var factor = (this.size == 3) ? 3.5: this.size;
    for (var i = 0; i < this.shape.offset.length; i++) {
      this.shape.offset[i].x = this.shape.offset[i].x / factor;
      this.shape.offset[i].y = this.shape.offset[i].y / factor;
    }
  }

  for(var i = 0; i < this.shape.points.length; i++) {

    var rotatedPointX = this.shape.offset[i].x * Math.cos(angle) - this.shape.offset[i].y * Math.sin(angle);
    var rotatedPointY = this.shape.offset[i].y * Math.cos(angle) + this.shape.offset[i].x * Math.sin(angle);

    this.shape.offset[i].x = rotatedPointX;
    this.shape.offset[i].y = rotatedPointY;

    this.shape.points[i].x = this.x + this.shape.offset[i].x;
    this.shape.points[i].y = this.y + this.shape.offset[i].y;
  }

  this.updatePolygon = function() {
	}; // updatePolygon

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

  this.draw = function(ctx, colorful) {
    if(this.destroyed == false) {
      ctx.save();
      ctx.beginPath();

      ctx.moveTo(this.shape.points[0].x, this.shape.points[0].y);
      for(var j = 1; j < this.shape.points.length; j++) {
        ctx.lineTo(this.shape.points[j].x, this.shape.points[j].y);
      }

      var asteroidColorHex = colorful ? this.hexColor : '#fff'; //
      var asteroidColorRGBA = colorful ? this.rgbaColor : 'rgba(255, 255, 255, .75)'; // rgba(0, 255, 128, .75)

      ctx.strokeStyle = asteroidColorHex;
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = asteroidColorHex;
      ctx.shadowBlur = 5;
      ctx.stroke();


      if(this.hq) {
        ctx.shadowBlur = 11;
        ctx.shadowColor = asteroidColorRGBA;
        ctx.stroke();

        ctx.shadowBlur = 7;
        ctx.shadowColor = asteroidColorRGBA;
        ctx.stroke();

        ctx.shadowBlur = 3;
        ctx.shadowColor = asteroidColorRGBA;
        ctx.stroke();
      }

      ctx.restore();
    } //
  }

  this.update = function(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    // Start: asteroid edge detection
    if(this.x > width) {
      this.x = 0;
    }
    if(this.x < 0) {
      this.x = width;
    }
    if(this.y > height) {
      this.y = 0;
    }
    if(this.y < 0) {
      this.y = height;
    }
    // End: asteroid edge detection

    this.angle += this.rotationSpeed;
    //this.angle = Math.PI / 2;
	  for(var i = 0; i < this.shape.points.length; i++) {
      var rotatedPointX = this.shape.offset[i].x * Math.cos(this.rotationSpeed) - this.shape.offset[i].y * Math.sin(this.rotationSpeed);
      var rotatedPointY = this.shape.offset[i].y * Math.cos(this.rotationSpeed) + this.shape.offset[i].x * Math.sin(this.rotationSpeed);

      this.shape.offset[i].x = rotatedPointX;
			this.shape.offset[i].y = rotatedPointY;

      this.shape.points[i].x = this.x + this.shape.offset[i].x;
      this.shape.points[i].y = this.y + this.shape.offset[i].y;
	  } // for
  }; // update
}; // Asteroid
