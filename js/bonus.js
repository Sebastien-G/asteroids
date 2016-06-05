'use strict';

var Bonus = function(x, y, heading, text) {
  this.x = x || 0;
  this.y = y || 0;
  this.text = text || '';

  this.hq = false;
  this.radius = 11;

  this.speed = utils.getRandomArbitrary(.5, 3);
  this.heading = heading;
  this.createdTime = new Date().getTime();
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;

  this.draw = function(rafTimer) {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

    // var gradient = this.ctx.createRadialGradient(0, 0, 9, 0, 0, 11);
    // gradient.addColorStop(0, fillColor);
    // gradient.addColorStop(1, this.strokeColor);
    // this.ctx.fillStyle = gradient;

    var fillColor = ((this.createdTime - rafTimer) % 3 == 0) ? this.colors[this.colorScheme].flicker : this.colors[this.colorScheme].fill;
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();

    this.ctx.strokeStyle = this.colors[this.colorScheme].stroke;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
/*
    if(this.hq) {
      this.ctx.shadowColor = this.colors[this.colorScheme].stroke;
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
    }
*/
    this.ctx.restore();
  }; // draw

  this.update = function(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    // Edge detection
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
  }; // update
}; // Bonus
Bonus.prototype.colors = {
  colorful: {
    fill: 'rgba(200, 222, 255, .5)',
    flicker: 'rgba(200, 222, 255, .66)',
    stroke: 'rgba(0, 128, 255, .75)'
  },
  monochrome: {
    fill: '#333',
    flicker: '#eee',
    stroke: '#eee'
  }
};

var BonusLabel = function(x, y, heading, text) {
  this.x = x || 0;
  this.y = y || 0;
  this.text = text || '';

  this.radius = 11;
  this.speed = 2;
  this.reach = 100;
  this.alpha = .9;
  this.distanceTraveled = 0;
  this.heading = heading;
  this.createdTime = new Date().getTime();
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;

  this.draw = function(rafTimer) {
    if(this.alpha > 0) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.beginPath();
      this.ctx.globalAlpha = this.alpha;
      this.ctx.font = '1.5em arial, sans-serif';
      this.ctx.fillStyle = this.colors[this.colorScheme].fill;
      this.ctx.fillText(this.text, 0, 0);
      this.ctx.lineWidth = 0.1;
      // this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      // this.ctx.strokeText(this.text, 0, 0);

      this.ctx.restore();
    }
  }

  this.update = function(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    this.distanceTraveled += this.speed;

    if(this.distanceTraveled > this.reach) {
      this.alpha -= 0.03;
    }

    // Edge detection
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
  }; // update
}; // Bonus
BonusLabel.prototype.colors = {
  colorful: {
    fill: 'rgba(255, 255, 255, .75)'
  },
  monochrome: {
    fill: '#efefef'
  }
};


var BonusFlash = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;

  this.radius = 1;
  this.maxRadius = 50;
  this.alpha = 1;
  this.createdTime = new Date().getTime();

  this.draw = function() {
    if(this.alpha > 0) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2 );
      this.ctx.globalAlpha = this.alpha;
      this.ctx.fillStyle = this.colors[this.colorScheme].fill;
      this.ctx.fill();

      this.ctx.restore();
    }
  }; // draw

  this.update = function(width, height) {
    //if(this.createdTime) {
      this.alpha -= 0.07;
      this.radius += 5;
    //}
  }; // update
}; // Bonus
BonusFlash.prototype.colors = {
  colorful: {
    fill: 'rgba(0, 153, 255, 1)'
  },
  monochrome: {
    fill: '#fff'
  }
};
