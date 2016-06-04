'use strict';

var DOMLoaded = function() {

  var renderLoop = function() {
    if(!game.rafTimer) {
      game.rafTimer = new Date().getTime();
      window.requestAnimationFrame(renderLoop);
      return;
    }

    var renderStage = false;
    if(game.asteroids && (game.stage == 'gameOn' || game.stage == 'gameOver' || game.stage == 'win' || game.stage == 'startScreen' )) {
      renderStage = true;
    }
    if(!renderStage) {
      game.ctx.clearRect(0, 0, game.width, game.height);
    }

    var oldTime = game.rafTimer;
    game.rafTimer = new Date().getTime();
    var delta = (game.rafTimer - oldTime);
    game.fps = (1 / delta) * 1000;

    if(game.debugMode) {
      var fpsClass = 'good';
      if(game.fps < 58) {
        fpsClass = 'medium';
      }
      else {
        if(game.fps < 50) {
          fpsClass = 'bad';
        }
      }
      var fpsElm = document.getElementById('fps');
      fpsElm.innerHTML = game.fps;
      fpsElm.className = fpsClass;
    }

    if(!game.paused && renderStage) {

      game.ctx.clearRect(0, 0, game.width, game.height);

      // Update then draw each asteroid
      if(game.asteroids.length) {
        game.checkAsteroidsCollisions();

        for (var i = game.asteroids.length - 1; i >= 0 ; i--) {
          game.asteroids[i].update(game.width, game.height);
          game.asteroids[i].draw(game.ctx, game.colorful);
        }
      }

      if(game.bonuses.length) {
        game.checkShipBonusCollision();
        for (var i = game.bonuses.length - 1; i >= 0; i--) {
          game.bonuses[i].update(game.width, game.height);
          game.bonuses[i].draw(game.ctx, game.colorful, game.rafTimer);
        }
      }

      if(game.bonusLabels.length) {
        for (var i = game.bonusLabels.length - 1; i >= 0; i--) {
          if(game.bonusLabels[i].alpha <= 0) {
            game.bonusLabels.splice(i, 1);
            continue;
          }

          game.bonusLabels[i].update(game.width, game.height);
          game.bonusLabels[i].draw(game.ctx, game.colorful);
        }
      }

      // We will rarely have several bonus flashes going on at once but it will happen
      if(game.bonusFlashes.length) {
        for (var i = game.bonusFlashes.length - 1; i >= 0; i--) {
          if(game.bonusFlashes[i].alpha <= 0) {
            game.bonusFlashes.splice(i, 1);
            continue;
          }

          game.bonusFlashes[i].update(game.width, game.height);
          game.bonusFlashes[i].draw(game.ctx, game.colorful);

        }
      }

      if(game.enemyShips.length) {
        game.checkShipPhotonCollision();
        game.checkLaserblastEnemyshipCollision();
        for (var i = game.enemyShips.length - 1; i >= 0; i--) {
          game.enemyShips[i].update(game.width, game.height, game.ship);
          if(game.enemyShips[i].photonTorpedos.length) {
            game.enemyShips[i].drawPhotonTorpedos(game.ctx, game.colorful, game.width, game.height);
          } // if(enemyShips[i].photonTorpedos.length)

          game.enemyShips[i].draw(game.ctx, game.colorful);
        }
      }

      if(game.ship.alive) {
        if(game.turningLeft) {
          game.ship.angle -= game.ship.rotationSpeed;
          game.ship.updateShape(-game.ship.rotationSpeed);
        }

        if(game.turningRight) {
          game.ship.angle += game.ship.rotationSpeed;
          game.ship.updateShape(game.ship.rotationSpeed);
        }

        if(game.thrusting) {
          game.ship.thrust(game.ship.angle);
        }

        game.ship.update(game.width, game.height);
        game.ship.draw(game.ctx, game.thrusting);

        if(game.firing) {
          if(game.ship.lastFire === null || (new Date().getTime() - game.ship.lastFire >= 150) ) {
            if(game.soundEffectsOn) {
              game.sound.laser.play();
            }
            game.ship.lastFire = new Date().getTime();
            game.ship.laserBlasts.push(new LaserBlast(game.ship.x, game.ship.y, game.ship.angle, game.colorful));
            game.score -= 10;
            game.updateScoreBoard();
          }
        } // if(firing)

        if(game.ship.laserBlasts.length) {
          game.ship.drawLasers(game.ctx, game.colorful, game.width, game.height);
        } // if(ship.laserBlasts.length)
      } // if(ship.alive)

      if(game.shipExplosion) {
        game.shipExplosion.draw(game.ctx, game.colorful);

        if(game.shipExplosion.bits.length <= 0) {
          game.shipExplosion = null;
        }
      }

      if(game.asteroidExplosions.length) {
        game.drawAsteroidExplosions();
      }
    } // !paused && renderStage

    if(!game.paused) {

      game.bgCtx.clearRect(0, 0, game.width, game.height);
      for(var i = 0; i < game.stars.length; i++) {
        var star = game.stars[i];
        star.update();
        game.bgCtx.save();
        game.bgCtx.beginPath();
        game.bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
        game.bgCtx.fillStyle = star.color;
        game.bgCtx.fill();
        game.bgCtx.restore();
      } // for
    }

    window.requestAnimationFrame(renderLoop);
  }; // renderLoop


  window.addEventListener('keydown', function(event) {
    if(game.stage == 'gameOn') {
      switch(event.keyCode) {
        case 32: // space
          game.firing = true;
          break;

        case 38: // up
          game.thrusting = true;
          break;

        case 37: // left
          game.turningLeft = true;
          break;

        case 39: // right
          game.turningRight = true;
          break;
      } // switch
    } // if(stage == 'gameOn')
    else {
      if(game.stage == 'startScreen') {
        if(event.keyCode == 32) {
          game.startGame();
        }
      }
    }
  }); // keydown


  window.addEventListener('keyup', function(event) {
    if(game.stage == 'gameOn') {
      switch(event.keyCode) {
        case 27: // Escape
          game.paused = !game.paused;
          game.setPaused();
          break;

        case 32: // space
          game.firing = false;
          game.paused = false;
          game.setPaused();
          break;

        case 38: // up
          game.thrusting = false;
          break;

        case 37: // left
          game.turningLeft = false;
          break;

        case 39: // right
          game.turningRight = false;
          break;
      } // switch
    } // if(stage == 'gameOn')
  }); // keyup


  var setUpMenus = function() {
    var menuButtons = document.querySelectorAll('#menu-select button');
    for(var i = 0; i < menuButtons.length; i++) {
      menuButtons[i].addEventListener('click', function(event) {
        //switchMenu(this.dataset.menu); // the right way
        switchMenu(this.getAttribute('data-menu')); // the lame IE9-compatible way
      });
    }
  }; // setUpMenus


  var switchMenu = function(menu) {
    var menuButtons = document.querySelectorAll('#menu-select button');
    for(var i = 0; i < menuButtons.length; i++) {
      if(menuButtons[i].getAttribute('data-menu') == menu) {
        menuButtons[i].className = 'current';
      }
      else {
        menuButtons[i].className = '';
      }
    }

    var menus = document.querySelectorAll('#menu-screen .menu');
    for(var i = 0; i < menus.length; i++) {
      if(menus[i].id == menu) {
        menus[i].style.display = 'block';
      }
      else {
        menus[i].style.display = 'none';
      }
    }
  }; // switchMenu


  var envSetup = function() {

    // CSS support detection
    var cssFeatureSupport = (function() {
      var p, property;
    	var cssProperties = 'textShadow,textStroke,boxShadow,borderRadius,borderImage,opacity'.split(',');
  		var cssPrefixes = 'Webkit,Moz,O,ms,Khtml'.split(',');
  		var testElm = document.createElement('css-detect');
  		var test = [];

    	var testPrefixes = function(prop) {
    		var capitalizedPropertyName = prop.charAt(0).toUpperCase() + prop.substr(1);
    		var propertyVariants = (prop + ' ' + cssPrefixes.join(capitalizedPropertyName + ' ') + capitalizedPropertyName).split(' ');

    		for (var n = 0; n < propertyVariants.length; n++) {
    			if (testElm.style[propertyVariants[n]] === '') {
            return true;
          };
    		}

        return false;
    	}; // testPrefixes

    	for(p in cssProperties) {
    		property = cssProperties[p];
    		test[property] = testPrefixes(property);
    	}

    	return test;
    }()); // IIFE (Crockford style) https://www.youtube.com/watch?v=taaEzHI9xyY&feature=youtu.be#t=33m39s

    // Apply extra class to old browsers that don't support CSS textStroke
    if(!cssFeatureSupport['textStroke']) {
      document.querySelector('#game-over .game-over').className += ' text-border';
    }
  }; // envSetup


  var setOptionsMenu = function() {
    document.getElementById('optionDebug').checked = game.debugMode;
    document.getElementById('optionMusic').checked = game.musicOn;
    document.getElementById('optionSoundEffects').checked = game.soundEffectsOn;
  }; // setOptionsMenu


  /* Start: options menu */
  /*document.getElementById('optionColorful').addEventListener('change', function() {
    colorful = document.getElementById('optionColorful').checked;
  });*/

  document.getElementById('optionDebug').addEventListener('change', function(event) {
    var fpsDisplayElm = document.getElementById('fps');
    //var debugCheckBox = document.getElementById('optionDebug');

    game.debugMode = (this.checked) ? true : false;
    fpsDisplayElm.style.display = (game.debugMode) ? 'block': 'none';
  });

  document.getElementById('optionMusic').addEventListener('change', function(event) {
    if(game.audioAvailable) {
      game.musicOn = (this.checked) ? true : false;
    }
  });

  document.getElementById('optionSoundEffects').addEventListener('change', function(event) {
    if(game.audioAvailable) {
      game.soundEffectsOn = (this.checked) ? true : false;
    }
  });
  /* End: options menu */


  // the button on the "win" page
  document.getElementById('play-again').addEventListener('click', function() {
    document.getElementById('win').style.display = 'none';
    game.resetGame();
    game.showStartScreen();
  });


  // High score input form
  var saveHighScore = function(event) {
    event.preventDefault();
    document.getElementById('hof-form').removeEventListener('submit', saveHighScore);

    var score = document.getElementById('hs-score').value;
    var name = document.getElementById('hs-name').value;
    document.getElementById('hof-input').style.display = 'none';

    if(game.stage == 'gameOver') {
      game.resetGame();
      game.switchMenu('scores-menu');
      game.showStartScreen();
    }

    ajaxGet('/asteroidsSaveScore.html?name=' + encodeURIComponent(name) + '&score=' + score, true, function() {
      game.reloadHighScores();
    });
  }; // saveHighScore
  document.getElementById('hof-form').addEventListener('submit', saveHighScore);


  var windowResizeHandler = function() {
    game.setCanvasFullSize(); //
  } // windowResizeHandler
  //window.addEventListener('optimizedResize', windowResizeHandler); // Uses a throttling function from Mozilla
  window.addEventListener('resize', windowResizeHandler); // Use dumb version for now


  setUpMenus();
  envSetup();
  var game = new Game();
  game.init();
  setOptionsMenu();
  renderLoop();

} // DOMLoaded

window.addEventListener('DOMContentLoaded', DOMLoaded);
