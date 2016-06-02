'use strict';


var Ship = function(params) {
  var angle = params.angle || 0;
  var direction = params.direction || 0;
  var speed = params.speed || 0;

  this.colorful = params.colorful || false;
  this.x = params.x || 0; // x position
  this.y = params.y || 0; // y position
  this.alive = true;
  this.thrustFactor = .1;
  this.maxSpeed = 15;
  this.laserBlasts = [];
  this.lastFire = null;
  this.invulnerable = false; // true | false

  this.hq = params.hq || false; // true | false

  this.angle = angle; // Different from heading
  this.rotationSpeed = .066;

  this.vx = Math.cos(direction) * speed; // x velocity
  this.vy = Math.sin(direction) * speed; // y velocity

  this.shapeUp = function() {
    /*return [
      { x: 0, y: -15},
      { x: 10, y: 10},
      { x: 0, y: 5},
      { x: -10, y: 10}
    ];*/
    return [
      { x: 0, y: -15},
      { x: 4.5, y: -5.5},
      { x: 10, y: 10},
      { x: 0, y: 5},
      { x: -10, y: 10},
      { x: -5, y: -4}
    ];
  }

  this.shape = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: this.shapeUp()
  };

  this.resetShape = function() {
    this.shape.offset = this.shapeUp();
  }

  this.updateShape = function(angle) {
		for(var i = 0; i < this.shape.points.length; i++) {
      var rotatedPointX = this.shape.offset[i].x * Math.cos(angle) - this.shape.offset[i].y * Math.sin(angle);
      var rotatedPointY = this.shape.offset[i].y * Math.cos(angle) + this.shape.offset[i].x * Math.sin(angle);

      this.shape.offset[i].x = rotatedPointX;
			this.shape.offset[i].y = rotatedPointY;

      this.shape.points[i].x = this.x + this.shape.offset[i].x;
      this.shape.points[i].y = this.y + this.shape.offset[i].y;
		}
	} // updateShape

  this.getSpeed = function() {
    return Math.sqrt((this.vx * this.vx) + (this.vy * this.vy)); // Pythagorean theorem
  }; // getSpeed

  this.setSpeed = function(speed) {
    var heading = this.getHeading();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  } // getSpeed

  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  }; // getHeading

  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  }; //setHeading

  this.thrust = function(heading) {
    this.vx += Math.cos(heading) * this.thrustFactor;
    this.vy += Math.sin(heading) * this.thrustFactor;

    // We must be able to thrust even if maxSpeed is reached
    if(Math.abs(this.vx) > this.maxSpeed) {
      this.vx = Math.sign(this.vx) * this.maxSpeed; // Math.sign is not supported in Internet Explorer (see polyfills.js)
    }
    if(Math.abs(this.vy) > this.maxSpeed) {
      this.vy = Math.sign(this.vy) * this.maxSpeed; // Math.sign is not supported in Internet Explorer (see polyfills.js)
    }
  };

  this.alphaToggle = true;
  this.draw = function(ctx, thrusting) {
    var alpha = 1;

    if(this.invulnerable) {
      if(this.timer == undefined) {
        this.timer = new Date().getTime();
      }

      var newTime = new Date().getTime();

      if(newTime - this.timer > 150) {
        this.alphaToggle = !this.alphaToggle;
        this.timer = newTime;
      }

      alpha = (this.alphaToggle) ? 1 : .3;
    }

    if(thrusting) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.shape.points[3].x, this.shape.points[3].y);
      ctx.rotate(this.angle + Math.PI * .5);

      var max = utils.getRandomIntInclusive(15, 22);
      ctx.beginPath();
      ctx.moveTo(0, max);
      ctx.lineTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.closePath();

      ctx.lineJoin = 'round';
      ctx.lineWidth = 1;
      ctx.strokeStyle = (this.colorful) ? 'rgba(255, 200, 0, .45)' : 'rgba(255, 255, 255, .45)';
      ctx.stroke();

      ctx.fillStyle = (this.colorful) ? 'rgba(255, 120, 0, .33)' : 'rgba(255, 255, 255, .33)';
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = alpha;

    ctx.moveTo(this.shape.points[0].x, this.shape.points[0].y);
    for(var j = 1; j < this.shape.points.length; j++) {
      ctx.lineTo(this.shape.points[j].x, this.shape.points[j].y);
    }

    ctx.lineJoin = 'round';

    ctx.closePath();
    ctx.strokeStyle = (this.colorful) ? 'rgb(255, 128, 0)' : '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    if(this.hq) {
      ctx.shadowColor = 'rgba(255, 128, 0, .75)';
      ctx.shadowBlur = 5;
      ctx.stroke();

      ctx.strokeStyle = '#a44';
      ctx.stroke();

      if(thrusting) {
        ctx.strokeStyle = '#a44';
        ctx.shadowBlur = 7;
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#542a00';
    ctx.fill();

    ctx.restore();
  }; // draw


  this.drawLasers = function(ctx, colorful, width, height) {
    for (var i = this.laserBlasts.length - 1; i >= 0; i--) {
      var laserBlast = this.laserBlasts[i];
      if(!laserBlast.wasted) {
        ctx.save();

        var endX = laserBlast.x + (laserBlast.length + 20) * Math.cos(laserBlast.heading);
        var endY = laserBlast.y + (laserBlast.length + 20) * Math.sin(laserBlast.heading);

        var startX = laserBlast.x + 20 * Math.cos(laserBlast.heading);
        var startY = laserBlast.y + 20 * Math.sin(laserBlast.heading);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(startX, startY);

        ctx.lineCap = 'round';
        ctx.lineWidth = laserBlast.width;
        ctx.strokeStyle = laserBlast.color + laserBlast.alpha;
        ctx.stroke();
        ctx.restore();

        laserBlast.update(width, height);
      }
      else {
        this.laserBlasts.splice(i, 1);
      }
    }
  }; // drawLasers


  this.update = function(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    // Start: ship edge detection
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
    } // End: ship edge detection

    this.updateShape(0);
  }; // update
}; // Ship


var LaserBlast = function(x, y, heading, colorful) {
  this.x = x;
  this.y = y;

  this.x0 = this.x;
  this.y0 = this.y;

  this.reach = 500;
  this.distanceTraveled = 0;
  this.wasted = false;
  this.length = 5;
  this.width = 4;
  this.alpha = '.75)';
  this.color = (colorful) ? 'rgba(64, 128, 255, ' : 'rgba(255, 255, 255, ';
  this.speed = 10;
  this.heading = heading;
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;

  this.update = function(width, height) {
    if(this.wasted) {
      delete this;
    }
    else {
      this.x0 = this.x;
      this.y0 = this.y;

      this.x += this.vx;
      this.y += this.vy;

      // Start: laserBlast edge detection
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
      } // End: laserBlast edge detection


      this.distanceTraveled += this.speed;
      if(this.distanceTraveled > this.reach) {
        this.wasted = true;
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.15)) {
        this.alpha = '0.5)';
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.1)) {
        this.alpha = '0.33)';
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.05)) {
        this.alpha = '0.1)';
      }
    }


  }; // update
}; // LaserBlast




var PhotonTorpedo = function(x, y, heading, colorful) {
  this.x = x;
  this.y = y;

  this.x0 = this.x;
  this.y0 = this.y;

  this.reach = 800;
  this.distanceTraveled = 0;
  this.wasted = false;
  this.radius = 6;
  this.width = 1;
  this.alpha = '.75)';
  this.color = (colorful) ? 'rgba(255, 0, 0, ' : 'rgba(255, 255, 255, ';
  this.speed = 6;
  this.heading = heading;
  this.vx = Math.cos(this.heading) * this.speed;
  this.vy = Math.sin(this.heading) * this.speed;
  this.rotation = 1;

  this.getSpeed = function() {
    return Math.sqrt((this.vx * this.vx) + (this.vy * this.vy)); // Pythagorean theorem
  }; // getSpeed

  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  }; // getHeading

  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  }; //setHeading


  this.update = function(width, height) {
    if(this.wasted) {
      delete this;
    }
    else {
      this.x0 = this.x;
      this.y0 = this.y;

      this.x += this.vx;
      this.y += this.vy;

      // Start: edge detection
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
      } // End: edge detection


      this.distanceTraveled += this.speed;
      if(this.distanceTraveled > this.reach) {
        this.wasted = true;
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.15)) {
        this.alpha = '0.5)';
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.1)) {
        this.alpha = '0.33)';
      }

      if(this.distanceTraveled > (this.reach - this.reach * 0.05)) {
        this.alpha = '0.1)';
      }
    }
  }; // update
}; // PhotonTorpedo


var EnemyShip = function(params) {
  var direction = params.direction || 0;
  var speed = params.speed || 0;

  this.x = params.x || 0; // x position
  this.y = params.y || 0; // y position
  this.colorful = params.colorful || true; // y position

  this.createdTime = new Date().getTime();
  this.vx = Math.cos(direction) * speed; // x velocity
  this.vy = Math.sin(direction) * speed; // y velocity
  this.firing = false;
  this.lastFire = 0;
  this.photonTorpedos = [];
  this.hitPoints = 1;
  this.points = 5000;
  this.destroyed = false;

  this.pursue = params.pursue || false;
  this.odometer = 0;
  this.range = utils.getRandomInt(300, 800);

  this.shape = {
    x: this.x,
    y: this.y,
    points: [
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 },
      {x: 0, y: 0 }
    ],
    offset: [
      { x: 17, y: 0},
      { x: 0, y: 15},
      { x: -17, y: 0},
      { x: 0, y: -25}
    ]
  };

  this.updateShape = function(angle) {
		for(var i = 0; i < this.shape.points.length; i++) {
      var rotatedPointX = this.shape.offset[i].x * Math.cos(angle) - this.shape.offset[i].y * Math.sin(angle);
      var rotatedPointY = this.shape.offset[i].y * Math.cos(angle) + this.shape.offset[i].x * Math.sin(angle);

      this.shape.offset[i].x = rotatedPointX;
			this.shape.offset[i].y = rotatedPointY;

      this.shape.points[i].x = this.x + this.shape.offset[i].x;
      this.shape.points[i].y = this.y + this.shape.offset[i].y;
		}
	}; // updateShape

  this.getSpeed = function() {
    return Math.sqrt((this.vx * this.vx) + (this.vy * this.vy)); // Pythagorean theorem
  }; // getSpeed

  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  }; // getHeading

  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  }; //setHeading


  this.draw = function(ctx, colorful, thrusting) {

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(this.shape.points[0].x, this.shape.points[0].y);
    for(var j = 1; j < this.shape.points.length; j++) {
      ctx.lineTo(this.shape.points[j].x, this.shape.points[j].y);
    }
    ctx.lineJoin = 'round';
    ctx.closePath();

    ctx.fillStyle = '#101628';
    ctx.fill();

    ctx.strokeStyle = (colorful) ? 'rgb(96, 112, 128)' : '#efefef';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }; // draw


  this.drawPhotonTorpedos = function(ctx, colorful, width, height) {
    for (var i = this.photonTorpedos.length - 1; i >= 0; i--) {
      var photonTorpedo = this.photonTorpedos[i];
      if(!photonTorpedo.wasted) {
        ctx.save();

        ctx.save();
        ctx.translate(photonTorpedo.x, photonTorpedo.y);

        ctx.lineCap = 'round';
        ctx.lineWidth = photonTorpedo.width;

        ctx.beginPath();
        ctx.rotate(photonTorpedo.rotation);
        ctx.moveTo(photonTorpedo.radius, 0);
        ctx.lineTo(-photonTorpedo.radius, 0);
        ctx.moveTo(0, photonTorpedo.radius);
        ctx.lineTo(0, -photonTorpedo.radius);
        ctx.strokeStyle = photonTorpedo.color + photonTorpedo.alpha;
        ctx.stroke();

        ctx.rotate(Math.PI * .125 * photonTorpedo.rotation);
        ctx.beginPath();
        ctx.moveTo(photonTorpedo.radius, 0);
        ctx.lineTo(-photonTorpedo.radius, 0);
        ctx.moveTo(0, photonTorpedo.radius);
        ctx.lineTo(0, -photonTorpedo.radius);
        ctx.strokeStyle = 'rgba(255, 128, 0,' + photonTorpedo.alpha;
        ctx.stroke();

        ctx.rotate(Math.PI * .25 * photonTorpedo.rotation);
        ctx.beginPath();
        ctx.moveTo(photonTorpedo.radius, 0);
        ctx.lineTo(-photonTorpedo.radius, 0);
        ctx.moveTo(0, photonTorpedo.radius);
        ctx.lineTo(0, -photonTorpedo.radius);
        ctx.strokeStyle = photonTorpedo.color + photonTorpedo.alpha;
        ctx.stroke();

        ctx.rotate(Math.PI * .375 * photonTorpedo.rotation);
        ctx.beginPath();
        ctx.moveTo(photonTorpedo.radius, 0);
        ctx.lineTo(-photonTorpedo.radius, 0);
        ctx.moveTo(0, photonTorpedo.radius);
        ctx.lineTo(0, -photonTorpedo.radius);
        ctx.strokeStyle = 'rgba(255, 128, 0,' + photonTorpedo.alpha;
        ctx.stroke();

        photonTorpedo.rotation += Math.PI / 8;

        ctx.restore();

        photonTorpedo.update(width, height);
      }
      else {
        this.photonTorpedos.splice(i, 1);
      }
    }
  }; // drawPhotonTorpedos


  this.update = function(width, height, ship) {
    var now = new Date().getTime();
    if(now - this.createdTime >= 1000) {
      this.firing = true;
    }

    if(this.firing) {
      if(this.lastFire == 0) {
        this.lastFire = new Date().getTime();
      }
      if(now - this.lastFire > 2000) {
        this.lastFire = new Date().getTime();
        var torp = new PhotonTorpedo(this.x, this.y, Math.atan2((ship.y + (ship.vy)) - this.y, (ship.x + (ship.vx)) - this.x), 1);
        this.photonTorpedos.push(torp);
      }
    }

    this.odometer += this.getSpeed();

    this.x += this.vx;
    this.y += this.vy;
    //this.distanceTraveledSinceLastDirectionChange

    // Start: edge detection
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
    } // End: edge detection


    if(this.odometer >= this.range) {
      this.odometer = 0;
      this.range = utils.getRandomInt(300, 800);

      this.setHeading(this.getHeading() + (Math.random() * (Math.PI / 3)));
    }

    this.updateShape(0);
  }; // update
};
