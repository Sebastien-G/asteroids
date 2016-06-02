'use strict';

var Bonus = function(x, y, heading, text) {
  this.x = x || 0;
  this.y = y || 0;
  this.text = text || '';

  this.hq = false;
  this.radius = 11;
  this.fillColor = 'rgba(200, 222, 255, .5)';
  this.flickerfillColor = 'rgba(200, 222, 255, .66)';
  this.strokeColor = 'rgba(0, 128, 255, .75)';
  this.speed = utils.getRandomArbitrary(.5, 3);
  this.heading = heading;
  this.createdTime = new Date().getTime();
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;

  this.draw = function(ctx, colorful, rafTimer) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

    // var gradient = ctx.createRadialGradient(0, 0, 9, 0, 0, 11);
    // gradient.addColorStop(0, fillColor);
    // gradient.addColorStop(1, this.strokeColor);
    // ctx.fillStyle = gradient;
    if(!colorful) {
      this.fillColor = '#333';
      this.flickerfillColor = '#eee';
      this.strokeColor = this.flickerfillColor;
    }
    var fillColor = ((this.createdTime - rafTimer) % 3 == 0) ? this.flickerfillColor : this.fillColor;
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    if(this.hq) {
      ctx.shadowColor = this.strokeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    ctx.restore();
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

  this.draw = function(ctx, colorful, rafTimer) {
    if(this.alpha > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.beginPath();
      ctx.globalAlpha = this.alpha;
      ctx.font = '1.5em arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, .75)';
      ctx.fillText(this.text, 0, 0);
      ctx.lineWidth = 0.1;
      // ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      // ctx.strokeText(this.text, 0, 0);

      ctx.restore();
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


var BonusFlash = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;

  this.radius = 1;
  this.maxRadius = 50;
  this.alpha = 1;
  this.createdTime = new Date().getTime();

  this.draw = function(ctx, colorful) {
    if(this.alpha > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2 );
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = (colorful) ? 'rgba(0, 153, 255, 1)' : "#fff";
      ctx.fill();

      ctx.restore();
    }
  }; // draw

  this.update = function(width, height) {
    //if(this.createdTime) {
      this.alpha -= 0.07;
      this.radius += 5;
    //}
  }; // update
}; // Bonus
