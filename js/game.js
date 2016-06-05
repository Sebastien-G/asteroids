'use strict';

var Game = function() {
  var self = this;

  this.bgCanvas = document.getElementById('bg-canvas');
  this.bgCtx = this.bgCanvas.getContext('2d');

  // main canvas
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext('2d');

  this.uiCanvas = document.getElementById('ui-canvas');
  this.uiCtx = this.uiCanvas.getContext('2d');

  this.host = window.location.host;
  //var selectedHost = (host == 'sebastienguillon.net') ? 'sebastienguillon.net' : '192.168.1.20'; // Needed for local use

  this.sound;
  this.checkAudioInterval;
  this.audioAvailable;

  this.debugMode = false; // true | false
  this.musicOn = true; // true | false
  this.soundEffectsOn = true; // true | false

  this.fps = 0; // FPS count (when debugMode is true)
  this.godMode = false; // true | false

  this.nbLives = 3;
  this.score = 0;
  this.currentProgress = 0;

  // Toggles some keyboard interactions
  this.stage = 'loadScreen'; // loadScreen | startScreen | startGame | gameOn | regen | gameOver | win

  this.colorful = true; // switches the game from black/white to colorful

  this.width, this.height, // height and width of the window
  this.ship, this.livesShip, // the actual ship and the ones used as "remaining lives"
  this.asteroids, this.asteroidExplosions, // lists of asteroids and their associated effects
  this.bonuses, this.bonusLabels, this.bonusFlashes, // lists of bonuses and their associated effects
  this.enemyShips, // list of active enemy ships
  this.turningLeft, this.turningRight, this.thrusting, this.firing, // possible actions of the ship (should be properties of Ship...)
  this.paused, // skips the rendering loop
  this.shipExplosion, // the explosion effect when the ship is destroyed
  this.rafTimer, // timer to throttle some actions in requestAnimationFrame
  this.level, // the level index (starting at 0)
  this.stars;
  this.nbBonuses = 0;
  this.levels;
  this.progressIncrements;


  // allows for easy reset of level bonuses between games
  this.getLevels = function() {
    return [{
      nbAsteroids: 4,
      nbEnemyShips: 0,
      enemyShipSpawnDelay: 10000,
      bonuses: {
        size1: ['HTML5', 'CSS3'],
        size2: ['Bilingue anglais'],
        size3: ['jQuery']
      }
    }, {
      nbAsteroids: 5,
      nbEnemyShips: 1,
      bonuses: {
        size1: ['Canvas', 'Bootstrap'],
        size2: ['jQuery UI', 'AngularJS'],
        size3: ['JavaScript']
      }
    }, {
      nbAsteroids: 6,
      nbEnemyShips: 1,
      bonuses: {
        size1: ['MongoDB', 'NodeJS'],
        size2: ['MeteorJS', 'ExpressJS'],
        size3: ['Websocket', 'Git']
      }
    }];
  };

  this.applyColor = function(colorful) {

    this.colorful = colorful;
    if(self.stage == 'gameOn') {
      this.updateLivesShips();
    }
    var monoStylesheet = document.getElementById('mono-stylesheet');
    //var monoStylesheet = document.styleSheets[1];

    if(!this.colorful) {
      this.bgCtx.clearRect(0, 0, this.width, this.height);
      if(!monoStylesheet) {
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', 'css/asteroids-mono.css');
        link.setAttribute('media', 'screen');
        link.setAttribute('type', 'text/css');
        link.setAttribute('id', 'mono-stylesheet');
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
    else {
      if(monoStylesheet) {
        document.getElementById('mono-stylesheet').remove();
      }

      //monoStylesheet.disabled == 'disabled'
    }

    Asteroid.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    Ship.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    EnemyShip.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    Bonus.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    BonusFlash.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    BonusLabel.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
    ExplosionBit.prototype.colorScheme = (colorful) ? 'colorful' : 'monochrome';
  }; // applyColor

  // Check mp3 audio support
  // http://diveintohtml5.info/everything.html
  this.checkAudioSupport = function() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
  }; // checkAudioSupport


  // Initial page setup and preloading of resources
  // A beginning is the time for taking the most delicate care that the balances are correct.
  this.init = function() {
    this.setCanvasFullSize();

    Asteroid.prototype.ctx = this.ctx;
    Ship.prototype.ctx = this.ctx;
    EnemyShip.prototype.ctx = this.ctx;
    Bonus.prototype.ctx = this.ctx;
    BonusFlash.prototype.ctx = this.ctx;
    BonusLabel.prototype.ctx = this.ctx;
    AsteroidExplosion.prototype.ctx = this.ctx;
    ShipExplosion.prototype.ctx = this.ctx;

    this.applyColor(this.colorful);

    this.levels = this.getLevels();

    for(var i = 0; i < this.levels.length; i++) {
      for(var prop in this.levels[i].bonuses) {
        if(this.levels[i].bonuses.hasOwnProperty(prop)) {
          this.nbBonuses += this.levels[i].bonuses[prop].length;
        }
      }
    }
    this.progressIncrements = 100 / this.nbBonuses; // the amount in percents each bonus is worth

    if(this.checkAudioSupport()) {
      this.audioAvailable = true;
      this.sound = new Sound();
      this.checkAudioInterval = window.setInterval(this.checkAudioReady, 1000);
    }
    else {
      this.audioAvailable = false;
      this.musicOn = false; // true | false
      this.soundEffectsOn = false; // true | false
      this.gameReady();
    }
    //setTimeout(this.gameReady, 1200);
  }; // init

  // Audio preload is too buggy, remove for now...
  this.checkAudioReady = function() {
    // if (self.sound.gameMusic.readyState === 4 &&
    //     self.sound.laser.pool[0].readyState === 4 &&
    //     self.sound.bonusPickup.pool[0].readyState === 4 &&
    //     self.sound.shipExplosion.pool[0].readyState === 4 &&
    //     self.sound.asteroidExplosion.pool[0].readyState === 4) {
      window.clearInterval(self.checkAudioInterval);
      self.gameReady();
    // }
  }; // checkAudioReady


  // self explanatory, some css rules do the rest
  this.setCanvasFullSize = function() {
    this.width = this.uiCanvas.width = this.canvas.width = this.bgCanvas.width = window.innerWidth;
    this.height = this.uiCanvas.height = this.canvas.height = this.bgCanvas.height = window.innerHeight;

    window.requestAnimationFrame(this.drawBg);
    if(self.stage == 'gameOn') {
      this.updateLivesShips();
    }
  }; // setCanvasFullSize


  // This is the stage where we may choose to start playing or go straight to the resume
  this.showStartScreen = function() {
    if(this.musicOn) {
      this.sound.gameMusic.pause(); // if music is playing from previous game
    }
    this.stage = 'startScreen';
    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('start-pause-screen').style.display = 'block';
    document.getElementById('start-screen').style.display = 'block';
    this.resetGame();
  }; // showStartScreen


  // This is just an intermediate stage that may be removed at some point
  this.gameReady = function() {
    document.getElementById('loading-screen').style.display = 'none';
    self.showStartScreen(); // SELF
  }; // gameReady


  // Reset all the variables for a new game
  this.resetGame = function() {
    this.nbLives = 3;
    this.score = 0;
    this.level = 0;
    this.levels = this.getLevels();

    if(this.ship) {
      this.ship == undefined;
    }

    this.updateScoreBoard();

    this.currentProgress = 0;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-info').style.display = 'none';

    document.querySelector('#game-info .progress').innerHTML = '0&#160;%';
    document.querySelector('#game-info .progress').style.width = '0%';
  }; // resetGame


  this.startGame = function() {
    this.stage = 'startGame';

    document.getElementById('fps').style.display = (this.debugMode) ? 'block': 'none';

    document.getElementById('start-pause-screen').style.display = 'none';
    document.getElementById('game-info').style.display = 'block';
    this.updateLivesShips();

    document.getElementById('win').style.display = 'none';

    if(this.musicOn) {
      this.sound.gameMusic.play();
    }

    this.startLevel();
  }; // startGame


  this.reloadHighScores = function() {
    ajaxGet('/asteroidsLoadHighScores.html', true, function(data) {
      document.getElementById('scores-menu').innerHTML = data.scoresTable;
    });
  }; // reloadHighScores


  this.startLevel = function() {
    document.getElementById('level-screen').style.display = 'block';
    document.querySelector('#level-screen .text').innerHTML = 'Niveau ' + (this.level + 1);

    this.paused = false;
    this.setPaused();

    this.turningLeft = false;
    this.turningRight = false;
    this.thrusting = false;
    this.firing = false;

    this.asteroids = [];
    this.enemyShips = [];
    this.bonuses = [];

    setTimeout(function() {
      document.getElementById('level-screen').style.display = 'none';

      self.ship = new Ship({
        x: self.width / 2,
        y: self.height / 2,
        speed: 0,
        direction: Math.PI * 1.5,
        angle: Math.PI * 1.5,
        colorful: self.colorful
      });
      self.ship.invulnerable = true;

      self.bonusLabels = []; // Keep bonus labels floating around
      self.bonusFlashes = [];
      self.asteroidExplosions = [];

      self.stage = 'gameOn';

      if(self.godMode) {
        self.ship.invulnerable = true;
      }

      setTimeout(function() {
        for (var i = 0; i < self.levels[self.level].nbEnemyShips; i++) {
          var enemyShip = new EnemyShip({
            x: Math.random() * self.width,
            y: Math.random() * self.height,
            speed: 2,
            direction: Math.random() * Math.PI * 2
          });
          self.enemyShips.push(enemyShip);
        }
      }, 10000);

      for (var i = 0; i < self.levels[self.level].nbAsteroids; i++) {
        var x = Math.random() * self.width;
        var y = Math.random() * self.height;
        var speed = Math.random() * 2 + 0.5;
        if(self.levels[self.level].bonuses.size1.length > 0) {
          var randomBonusIdx = Math.floor(Math.random() * self.levels[self.level].bonuses.size1.length);
          var bonus = self.levels[self.level].bonuses.size1.splice(randomBonusIdx, 1);
        }
        else {
          var bonus = '';
        }

        var asteroid = new Asteroid({
          x: x,
          y: y,
          speed: speed,
          size: 1,
          direction: Math.random() * Math.PI * 2,
          bonus: bonus[0],
          angle: Math.random() * Math.PI * 2
        });

        self.asteroids.push(asteroid);
      }

      setTimeout(function() {
        if(!self.godMode) {
          self.ship.invulnerable = false;
        }
      }, 1500);
    }, 1500);
  }; // startLevel


  this.checkClearSkies = function() {
    // This is a nasty fix for an as yet unidentified bug
    for (var i = this.asteroids.length - 1; i >= 0; i--) {
      if(this.asteroids[i].destroyed === true) {
        this.asteroids.splice(i, 1);
      }
    }
    for (var i = this.enemyShips.length - 1; i >= 0; i--) {
      if(this.enemyShips[i].destroyed === true) {
        this.enemyShips.splice(i, 1);
      }
    } // end: fix

    var nbObjects = this.bonuses.length + this.asteroids.length + this.enemyShips.length;

    if(nbObjects === 0) {
      if(this.level < (this.levels.length - 1)) {
        this.level++;
        this.startLevel();
      }
    }
  }; // checkClearSkies


  // Reset ship after life lost
  this.regenerate = function() {
    self.ship.laserBlasts = [];
    self.ship.x = self.width / 2;
    self.ship.y = self.height / 2;
    self.ship.invulnerable = true;
    self.ship.alive = true;
    self.ship.setSpeed(0);
    self.ship.direction = Math.PI * 1.5; // head up
    self.ship.angle = Math.PI * 1.5; // point up
    self.ship.resetShape();

    window.setTimeout(function() {
      if(!self.godMode) {
        self.ship.invulnerable = false;
      }
    }, 1500);
  }; // regenerate


  this.updateScoreBoard = function() {
    document.querySelector('#game-info .score').innerHTML = this.score;
  }; // updateScoreBoard


  this.checkHighScores = function(score, callback) {
    document.getElementById('hs-score').value = score;

    ajaxGet('/asteroidsCheckHighScores.html?score=' + score, true, function(json) {
      if(json.qualifies) {
        document.getElementById('hof-input').style.display = 'block';
        document.getElementById('hs-name').focus();
      }
      callback(json.qualifies);
    });
  }; //checkHighScores(10000);


  this.gameOver = function() {
    this.stage = 'gameOver';

    window.setTimeout(function() {
      document.querySelector('#game-over .press-space-continue').style.display = 'none';
      document.getElementById('game-over').style.display = 'block';

      self.checkHighScores(self.score, function(qualifies) {
        if(!qualifies) {
          window.setTimeout(function() {
            document.querySelector('#game-over .press-space-continue').style.display = 'block';
            window.addEventListener('keydown', self.pressSpaceContinue);
          }, 2000);
        }
      });
    }, 1000);
  }; // gameOver


  this.pressSpaceContinue = function(event) {
    if(event.keyCode == 32) {
      event.preventDefault();
      window.removeEventListener('keydown', self.pressSpaceContinue);
      self.resetGame();
      self.showStartScreen();
    }
  }; // pressSpaceContinue


  // This is the heart of the polygon collision detection
  // The spaceship, the asteroids and the enemy ships use this segment
  // intersection function to detect collisions
  this.segmentIntersect = function(p0, p1, p2, p3) {
    var A1 = p1.y - p0.y,
      B1 = p0.x - p1.x,
      C1 = A1 * p0.x + B1 * p0.y,
      A2 = p3.y - p2.y,
      B2 = p2.x - p3.x,
      C2 = A2 * p2.x + B2 * p2.y,
      denominator = A1 * B2 - A2 * B1;

    if(denominator === 0) {
      return null;
    }

    var intersectX = (B2 * C1 - B1 * C2) / denominator,
      intersectY = (A1 * C2 - A2 * C1) / denominator,
      rx0 = (intersectX - p0.x) / (p1.x - p0.x),
      ry0 = (intersectY - p0.y) / (p1.y - p0.y),
      rx1 = (intersectX - p2.x) / (p3.x - p2.x),
      ry1 = (intersectY - p2.y) / (p3.y - p2.y);

    if(((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) &&
       ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
      return {
        x: intersectX,
        y: intersectY
      };
    }
    else {
      return null;
    }
  }; // segmentIntersect


  // Checks if ship is touching a "bonus" and should collect it
  // This uses a simple point/circle collision detection
  this.checkShipBonusCollision = function() {
    if(this.ship.alive) { // this should not be needed (but it is for now)
      var shipCircle = {
        x: this.ship.x,
        y: this.ship.y,
        radius: 20
      }

      for (var j = 0; j < this.bonuses.length; j++) {
        var bonus = this.bonuses[j];

        // Don't loop through all points if the ship is not in the vicinity
        // of the bonus
        if(utils.circleCollision(bonus, shipCircle)) {
          for(var i = 0; i < this.ship.shape.points.length; i++) {
            var shipPoint = this.ship.shape.points[i];
            if(utils.circlePointCollision(shipPoint.x, shipPoint.y, bonus)) {
              var collectedBonus = this.bonuses.splice(j, 1);
              if(this.soundEffectsOn) {
                this.sound.bonusPickup.play();
              }
              this.integrateBonus(collectedBonus[0]);
              this.checkClearSkies();
              return;
            }
          } // for j
        }
      } // for i
    }
  }; // checkShipBonusCollision


  // If the ship caught a bonus, display the bonus label and update progress
  this.integrateBonus = function(bonus) {
    this.currentProgress += Math.ceil(this.progressIncrements);
    var displayPercentage = (this.currentProgress > 100) ? 100 : this.currentProgress;
    document.querySelector('#game-info .progress').innerHTML = displayPercentage + '&#160;%';
    document.querySelector('#game-info .progress').style.width = displayPercentage + '%';
    this.bonusLabels.push(new BonusLabel(bonus.x, bonus.y, bonus.heading, bonus.text));
    this.bonusFlashes.push(new BonusFlash(bonus.x, bonus.y));

    if(displayPercentage >= 100) {
      this.ship.invulnerable = true; // the game loop will keep running in the
      //background, so make sure the ship doesn't "die" after the game is won
      this.stage = 'win';

      setTimeout(function() {
        self.turningLeft = false;
        self.turningRight = false;
        self.thrusting = false;
        self.firing = false;

        var winElm = document.getElementById('win');
        winElm.style.display = 'block';
        winElm.focus();

        winElm.style.transition = 'background-color 1s';
        winElm.style.backgroundColor = 'rgba(0, 0, 0, .5)';
        self.checkHighScores(self.score, function() {

        });
      }, 1000);
    }
  }; // integrateBonus


  this.checkShipPhotonCollision = function() {
    if(this.ship.alive) { // this should not be needed (but it is for now)
      var shipCircle = {
        x: this.ship.x,
        y: this.ship.y,
        radius: 40
      }

      for(var i = 0; i < this.enemyShips.length; i++) {
        var enemyShip = this.enemyShips[i];

        for (var j = 0; j < enemyShip.photonTorpedos.length; j++) {
          var photonTorpedo = enemyShip.photonTorpedos[j];

          // Don't loop through all points if the ship is not in the vicinity
          // of the photon torpedo
          if(utils.circleCollision(photonTorpedo, shipCircle)) {
            for(var k = 0; k < this.ship.shape.points.length; k++) {
              var shipPoint = this.ship.shape.points[k];
              if(utils.circlePointCollision(shipPoint.x, shipPoint.y, photonTorpedo)) {
                if(!this.ship.invulnerable) {
                  photonTorpedo.wasted = true;
                  if(this.soundEffectsOn) {
                    this.sound.shipExplosion.play();
                  }
                  this.shipExplosion = new ShipExplosion(shipPoint.x, shipPoint.y, photonTorpedo.getHeading(), this.ship.getSpeed(), this.colorful);
                  this.ship.alive = false;
                  this.nbLives--;
                  this.updateLivesShips();
                  if(this.nbLives > 0) {
                    this.ship.invulnerable = true;
                    setTimeout(this.regenerate, 1500);
                  }
                  else {
                    this.gameOver();
                  }
                }
              }
            }
          }
        }
      }
    }
  }; // checkShipPhotonCollision


  this.checkLaserblastEnemyshipCollision = function() {
    if(this.ship.laserBlasts.length) {

      for(var i = this.enemyShips.length - 1; i >= 0; i--) {
        var enemyShip = this.enemyShips[i];

          for(var z = 0; z < enemyShip.shape.points.length; z++) {
            var p0 = enemyShip.shape.points[z];
            var p1 = enemyShip.shape.points[(z + 1) % enemyShip.shape.points.length];

            for(var b = 0; b < this.ship.laserBlasts.length; b++) {
              var p2 = {x: this.ship.laserBlasts[b].x0, y: this.ship.laserBlasts[b].y0};
              var p3 = {x: this.ship.laserBlasts[b].x, y: this.ship.laserBlasts[b].y};

              if(!this.ship.laserBlasts[b].wasted) {
                var hitPoint = this.segmentIntersect(p0, p1, p2, p3);
                if(hitPoint) {

                  enemyShip.hitPoints--;
                  if(enemyShip.hitPoints <= 0) {

                    this.score += enemyShip.points;
                    this.updateScoreBoard();
                    if(this.soundEffectsOn) {
                      this.sound.asteroidExplosion.play();
                    }

                    this.asteroidExplosions.push(new AsteroidExplosion(
                      this.ship.laserBlasts[b].x,
                      this.ship.laserBlasts[b].y,
                      (this.ship.laserBlasts[b].heading + Math.PI),
                      this.colorful,
                      'laserHitEnemy'
                    ));

                    enemyShip.destroyed = true;
                    this.checkClearSkies();
                  } // if(asteroids[a].hitPoints <= 0)
                  else {
                    this.asteroidExplosions.push(new AsteroidExplosion(ship.laserBlasts[b].x, ship.laserBlasts[b].y, (ship.laserBlasts[b].heading + Math.PI), colorful, 'laserHitEnemy'));
                  }

                  this.ship.laserBlasts[b].wasted = true;
                  this.ship.laserBlasts.splice(b, 1);
                  return true;

              } // if(hitPoint)
            }
          }
        }
      }
    }
  }; // checkLaserblastEnemyshipCollision


  // Check collisions between ship and asteroids and also lasersblasts and asteroids
  this.checkAsteroidsCollisions = function() {
    // Because the animation loop can keep playing in the background, do not detect collisions when ship is "dead"
    if(this.ship.alive) {

      for (var a = this.asteroids.length -1; a >= 0; a--) {
        if(!this.asteroids[a].destroyed) {
          for(var i = 0; i < this.asteroids[a].shape.points.length; i++) {
            var p0 = this.asteroids[a].shape.points[i];
            var p1 = this.asteroids[a].shape.points[(i + 1) % this.asteroids[a].shape.points.length];

            if(this.ship.laserBlasts.length) {
              for(var b = 0; b < this.ship.laserBlasts.length; b++) {
                var p2 = {x: this.ship.laserBlasts[b].x0, y: this.ship.laserBlasts[b].y0};
                var p3 = {x: this.ship.laserBlasts[b].x, y: this.ship.laserBlasts[b].y};

                if(!this.ship.laserBlasts[b].wasted) {

                  var hitPoint = this.segmentIntersect(p0, p1, p2, p3);
                  if(hitPoint) {
                    this.asteroids[a].hitPoints--;
                    if(this.asteroids[a].hitPoints <= 0) {

                      this.score += this.asteroids[a].points;
                      this.updateScoreBoard();
                      if(this.soundEffectsOn) {
                        this.sound.asteroidExplosion.play();
                      }

                      this.asteroidExplosions.push(new AsteroidExplosion(
                        this.ship.laserBlasts[b].x,
                        this.ship.laserBlasts[b].y,
                        (this.ship.laserBlasts[b].heading + Math.PI),
                        this.colorful
                      ));

                      if(this.asteroids[a].bonus != '') {
                        this.bonuses.push(new Bonus(this.asteroids[a].x, this.asteroids[a].y, Math.random() * Math.PI * 2, this.asteroids[a].bonus));
                      }

                      this.asteroids[a].destroyed = true;
                      var asteroidSplit = this.asteroids[a].splitInto;
                      var asteroidX = this.asteroids[a].x;
                      var asteroidY = this.asteroids[a].y;
                      var asteroidSize = this.asteroids[a].size;
                      var asteroidSpeed = this.asteroids[a].getSpeed();
                      var asteroidPoints = this.asteroids[a].points;

                      if(asteroidSplit > 0) {
                        for (var i = 0; i < asteroidSplit; i++) {
                          var newSize = (asteroidSize < 3) ? asteroidSize + 1 : 3;
                          var bonusSize = 'size' + newSize;

                          if(this.levels[this.level].bonuses[bonusSize].length > 0) {
                            var randomBonusIdx = Math.floor(Math.random() * this.levels[this.level].bonuses[bonusSize].length);
                            var bonus = this.levels[this.level].bonuses[bonusSize].splice(randomBonusIdx, 1);
                          }
                          else {
                            var bonus = '';
                          }

                          var asteroid = new Asteroid({
                            x: asteroidX,
                            y: asteroidY,
                            speed: asteroidSpeed * (Math.random() * (1.5 - 1.1) + 1.1),
                            direction: Math.random() * Math.PI * 2,
                            size: newSize,
                            angle: Math.random() * Math.PI * 2,
                            bonus: bonus
                          });

                          asteroid.splitInto = (newSize < 3) ? 2 : 0;
                          asteroid.points = asteroidPoints * (newSize / 2);

                          this.asteroids.push(asteroid);
                        }
                      }
                      this.checkClearSkies(); // must check only after split

                    } // if(asteroids[a].hitPoints <= 0)
                    else {
                      this.asteroidExplosions.push(new AsteroidExplosion(this.ship.laserBlasts[b].x, this.ship.laserBlasts[b].y, (this.ship.laserBlasts[b].heading + Math.PI), this.colorful, 'laserHit'));
                    }

                    this.ship.laserBlasts[b].wasted = true;
                    this.ship.laserBlasts.splice(b, 1);
                    return true;

                  } // if(hitPoint)
                }
              } // for b
            } // if ship.laserBlasts


            // Ship to asteroid collision
            for(var j = 0; j < this.ship.shape.points.length; j++) {
              var p2 = this.ship.shape.points[j];
              var p3 = this.ship.shape.points[(j + 1) % this.ship.shape.points.length];

              var crashPoint = this.segmentIntersect(p0, p1, p2, p3);
              if(crashPoint) {
                if(!this.ship.invulnerable) {
                  //stage = 'regen';
                  if(this.soundEffectsOn) {
                    this.sound.shipExplosion.play();
                  }
                  this.shipExplosion = new ShipExplosion(crashPoint.x, crashPoint.y, this.ship.getHeading(), this.ship.getSpeed(), this.colorful);
                  this.ship.alive = false;
                  this.nbLives--;
                  this.updateLivesShips();
                  if(this.nbLives > 0) {
                    this.ship.invulnerable = true;
                    setTimeout(this.regenerate, 1500);
                  }
                  else {
                    this.gameOver();
                  }
                  return true;
                }
              }
            } // for j
          } // for i
        } else {
          this.asteroids.splice(a, 1);
        }
      }
    } // if(ship.alive)
  }; // checkAsteroidsCollisions


  // Displays the dummy ships representing the number of lives left
  // (top left of the screen)
  // Importantly this is drawn on a separate "UI" canvas
  this.updateLivesShips = function() {
    window.requestAnimationFrame(function() {
      self.uiCtx.clearRect(0, 0, self.width, self.height);

      var left = 40;
      for (var i = 0; i < self.nbLives; i++) {
        self.livesShip = new Ship({
          x: left,
          y: 40,
          speed: 0,
          direction: Math.PI * 1.5,
          angle: Math.PI * 1.5,
          colorful: self.colorful
        });
        self.livesShip.update();

        self.uiCtx.save();
        self.uiCtx.beginPath();
        self.uiCtx.opacity = 0.9;

        self.uiCtx.moveTo(self.livesShip.shape.points[0].x, self.livesShip.shape.points[0].y);
        for(var j = 1; j < self.livesShip.shape.points.length; j++) {
          self.uiCtx.lineTo(self.livesShip.shape.points[j].x, self.livesShip.shape.points[j].y);
        }

        self.uiCtx.lineJoin = 'round';

        self.uiCtx.closePath();
        self.uiCtx.strokeStyle = 'rgba(255, 255, 255, .9)';

        /*self.uiCtx.shadowColor = 'rgba(255, 255, 255, .5)';
        self.uiCtx.shadowBlur = 10;*/
        self.uiCtx.lineWidth = 3;
        self.uiCtx.stroke();

        self.uiCtx.strokeStyle = (self.colorful) ? '#864' : '#666';
        /*self.uiCtx.shadowBlur = 5;*/
        self.uiCtx.stroke();

        self.uiCtx.fillStyle = (self.colorful) ? '#1a1e2a': '#1e1e1e';
        self.uiCtx.fill();
        self.uiCtx.restore();

        left += 40;
      } // for
    }); // requestAnimationFrame
  }; // updateLivesShips


  this.drawAsteroidExplosions = function() {
    for (var i = 0; i < this.asteroidExplosions.length; i++) {
      var asteroidExplosion = this.asteroidExplosions[i];

      for (var j = 0; j < asteroidExplosion.bits.length; j++) {
        var bit = asteroidExplosion.bits[j];

        this.ctx.save();
        this.ctx.translate(bit.x, bit.y);
        this.ctx.scale(bit.scale, bit.scale);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, bit.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = bit.color;
        this.ctx.fill();
        this.ctx.restore();
        bit.update();

        if(bit.scale <= 0) {
          asteroidExplosion.bits.splice(j, 1);
        }
      } // for j

      if(asteroidExplosion.bits.length < 1) {
        this.asteroidExplosions.splice(i, 1);
      }
    } // for i
  }; // drawAsteroidExplosions


  this.drawBg = function() {

    var nbStars1 = 400;
    var stars1 = [];

    for(var i = 0; i < nbStars1; i++ ) {
      var star = new Star({
        width: self.width,
        height: self.height,
        radius: Math.random() / 1.5,
        x: Math.random() * self.width,
        y: Math.random() * self.height,
        direction: Math.PI * 1.5,
        speed: 0.3
      });
      stars1.push(star);
    }

    var nbStars2 = 200;
    var stars2 = [];
    for(var i = 0; i < nbStars2; i++ ) {
      var star = new Star({
        width: self.width,
        height: self.height,
        radius: Math.random() * 1.2,
        x: Math.random() * self.width,
        y: Math.random() * self.height,
        direction: Math.PI * 1.5,
        speed: 0.5
      });
      stars2.push(star);
    }

    var nbStars3 = 80;
    var stars3 = [];
    for(var i = 0; i < nbStars3; i++ ) {
      var star = new Star({
        width: self.width,
        height: self.height,
        radius: Math.random() * 2.5,
        x: Math.random() * self.width,
        y: Math.random() * self.height,
        direction: Math.PI * 1.5,
        speed: 1
      });
      stars3.push(star);
    }

    self.stars = stars1.concat(stars2, stars3);
  }; // drawBg


  this.setPaused = function() {
    var pauseElm = document.getElementById('pause-screen');
    if(this.paused) {
      if(this.musicOn) {
        this.sound.gameMusic.pause();
      }

      if(pauseElm.style.display == 'none' || pauseElm.style.display === '') {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('start-pause-screen').style.display = 'block';
        pauseElm.style.display = 'block';
        pauseElm.focus();

        pauseElm.style.transition = 'background-color .66s';
        pauseElm.style.backgroundColor = 'rgba(0, 0, 0, .5)';
      }
    }
    else {
      if(this.musicOn) {
        this.sound.gameMusic.play();
      }
      pauseElm.style.transition = 'all 0s';
      pauseElm.style.backgroundColor = '';
      pauseElm.style.display = 'none';
      document.getElementById('start-pause-screen').style.display = 'none';
    }
  }; // setPaused
}; // Game
