'use strict';


var DOMLoaded = function() {

  var Star = function(params) {
    var direction = params.direction || 0;
    var speed = params.speed || 0;

    this.x = params.x || 0; // x position
    this.y = params.y || 0; // y position
    this.radius = params.radius || 1;
    this.color = params.color || '#fff';

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
      this.x += this.vx;
      this.y += this.vy;
    }; // update

  }; // Star
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;

  var nbStars1 = 500;
  var stars1 = [];

  for(var i = 0; i < nbStars1; i++ ) {
    var star = new Star({
      radius: Math.random() / 1.5,
      x: Math.random() * width,
      y: Math.random() * height,
      direction: Math.PI * 1.5,
      speed: .3,
      color: '#fff'
    });
    stars1.push(star);
  }

  var nbStars2 = 200;
  var stars2 = [];
  for(var i = 0; i < nbStars2; i++ ) {
    var star = new Star({
      radius: Math.random() * 1.2,
      x: Math.random() * width,
      y: Math.random() * height,
      direction: Math.PI * 1.5,
      speed: .5,
      color: '#fff'
    });
    stars2.push(star);
  }

  var nbStars3 = 100;
  var stars3 = [];
  for(var i = 0; i < nbStars3; i++ ) {
    var star = new Star({
      radius: Math.random() * 2.5,
      x: Math.random() * width,
      y: Math.random() * height,
      direction: Math.PI * 1.5,
      speed: 1,
      color: '#fff'
    });
    stars3.push(star);
  }

  var stars = stars1.concat(stars2, stars3);

  var renderLoop = function() {
    ctx.clearRect(0, 0, width, height);

    for(var i = 0; i < stars.length; i++) {
      var star = stars[i];
      star.update();

      ctx.save();
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = star.color;
      ctx.fill();

      if(star.y + star.radius < 0) {
        star.y = height;
        star.x = star.x + Math.random() * 30;
      }
      ctx.restore();
    } // for

    requestAnimationFrame(renderLoop);
  } // renderLoop

  renderLoop();


  document.getElementById('play-asteroids').addEventListener('click', function() {
    window.location = '/';
  });

} // DOMLoaded

window.addEventListener('DOMContentLoaded', DOMLoaded);
