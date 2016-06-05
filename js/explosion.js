'use strict';


var AsteroidExplosion = function(x, y, heading, colorful, type) {
  this.x = x || 0;
  this.y = y || 0;
  this.heading = heading || 0;
  this.bits = [];
  if(type == undefined) {
    type = 'asteroidExplosion';
  }

  this.nbBits = 20;
  this.minSpeed = 1;
  this.maxSpeed = 5;
  this.radiusMin = .5;
  this.radiusMax = 5;
  this.spread = 1.6;

  if(type == 'laserHit') {
    this.nbBits = 10;
    this.minSpeed = 1;
    this.maxSpeed = 5;
    this.radiusMin = .1;
    this.radiusMax = 3;
    this.spread = 4;
  }

  if(type == 'laserHitEnemy') {
    this.nbBits = 20;
    this.minSpeed = 1;
    this.maxSpeed = 7;
    this.radiusMin = .5;
    this.radiusMax = 8;
    this.spread = 1.6;
  }

  for (var i = 0; i < this.nbBits; i++) {
    var bit = new ExplosionBit(this.x, this.y, heading, this.minSpeed, this.maxSpeed, type, this.radiusMin, this.radiusMax, this.spread);
    this.bits.push(bit);
  }

  this.draw = function() {
    for (var i = this.bits.length - 1; i >= 0; i--) {
      this.ctx.save();
      this.ctx.translate(this.bits[i].x, this.bits[i].y);
      this.ctx.scale(this.bits[i].scale, this.bits[i].scale);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bits[i].radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.bits[i].color;
      this.ctx.fill();
      this.ctx.restore();
      this.bits[i].update();

      if(this.bits[i].scale <= 0) {
        this.bits.splice(i, 1);
      }
    } // for j
  }; // draw
}; // AsteroidExplosion




var ShipExplosion = function(x, y, shipHeading, shipSpeed, colorful) {
  this.x = x;
  this.y = y;
  this.bits = [];
  this.nbBits = 20 + shipSpeed;
  // this.colors = (colorful) ? ['#33150a', '#fffe8d', '#f8cf35', '#f8cf35', '#853119', '#f2a324'] : ['#aaa', '#bbb', '#ccc', '#e1e1e1', '#efefef', '#fff'];
  this.radiusMin = 1;
  this.radiusMax = 15;
  this.spread = 2;

  this.minExplosionSpeed = 3;
  this.maxExplosionSpeed = this.minExplosionSpeed * (shipSpeed / 2);

  for (var i = 0; i < this.nbBits; i++) {
    var bit = new ExplosionBit(this.x, this.y, shipHeading, this.minExplosionSpeed, this.maxExplosionSpeed, 'shipExplosion', this.radiusMin, this.radiusMax, this.spread);
    this.bits.push(bit);
  }

  this.draw = function() {
    for (var i = this.bits.length - 1; i >= 0; i--) {
      this.ctx.save();
      this.ctx.translate(this.bits[i].x, this.bits[i].y);
      this.ctx.scale(this.bits[i].scale, this.bits[i].scale);
      this.ctx.globalAlpha = this.bits[i].alpha;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bits[i].radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.bits[i].color;
      this.ctx.fill();
      this.ctx.restore();
      this.bits[i].update();
      if(this.bits[i].scale < 0) {
        this.bits.splice(i, 1);
      }
    }
  }; // draw
}; // ShipExplosion


var ExplosionBit = function(x, y, heading, minSpeed, maxSpeed, type, radiusMin, radiusMax, spread) {
  this.x = x;
  this.y = y;
  this.scale = 1;
  this.alpha = .9;
  this.shrinkSpeed = Math.random() * (.05 - .01) + .01;
  this.radius = utils.getRandomIntInclusive(radiusMin, radiusMax);

console.log('type: ' + type);
  this.color = this.colors[type][this.colorScheme][Math.floor(Math.random() * this.colors[type][this.colorScheme].length)];
  this.speed = utils.getRandomIntInclusive(minSpeed, parseInt(maxSpeed));
  this.heading = utils.getRandomArbitrary(heading - Math.PI / spread, heading + Math.PI / spread);
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;

  this.update = function() {
    this.scale = (this.scale <= 0 ) ? 0 : (this.scale - this.shrinkSpeed);
    this.alpha -= (Math.random() * .03);
    if(this.alpha <= 0 ) {
      this.alpha = 0;
    }
    this.x += this.vx;
    this.y += this.vy;
  }
}; // ExplosionBit
ExplosionBit.prototype.colors = {
  asteroidExplosion: {
    colorful: ['#0f9', '#00b36b', '#00cc7a', '#00e68a', '#4dffb8'],
    monochrome: ['#aaa', '#bbb', '#ccc', '#e1e1e1', '#efefef', '#fff']
  },
  laserHit: {
    colorful: ['#09f', '#006bb3', '#007acc', '#008ae6', '#4db8ff'],
    monochrome: ['#aaa', '#bbb', '#ccc', '#e1e1e1', '#efefef', '#fff']
  },
  laserHitEnemy: {
    colorful: ['#f60', '#b34b00', '#cc5a00', '#e66a00', '#ff984d'],
    monochrome: ['#aaa', '#bbb', '#ccc', '#e1e1e1', '#efefef', '#fff']
  },
  shipExplosion: {
    colorful: ['#33150a', '#fffe8d', '#f8cf35', '#f8cf35', '#853119', '#f2a324'],
    monochrome: ['#aaa', '#bbb', '#ccc', '#e1e1e1', '#efefef', '#fff']
  }
};
