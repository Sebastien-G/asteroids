var SoundPool = function(maxSize) {
  var size = maxSize;
  var pool = [];
  var currSound = 0;

  this.pool = pool;

  this.init = function(sound) {
    switch (sound) {
      case 'laser':
        for (var i = 0; i < size; i++) {
          var laser = new Audio('audio/laser.mp3');
          laser.volume = .12;
          laser.load();
          pool[i] = laser;
        } // for
        break;

      case 'asteroidExplosion':
        for (var i = 0; i < size; i++) {
          var asteroidExplosion = new Audio('audio/asteroid-explosion.mp3');
          asteroidExplosion.volume = .06;
          asteroidExplosion.load();
          pool[i] = asteroidExplosion;
        } // for
        break;

      case 'shipExplosion':
        for (var i = 0; i < size; i++) {
          var shipExplosion = new Audio('audio/ship-explosion.mp3');
          shipExplosion.volume = .1;
          shipExplosion.load();
          pool[i] = shipExplosion;
        } // for
        break;

      case 'bonusPickup':
        for (var i = 0; i < size; i++) {
          var bonusPickup = new Audio('audio/bonus-pickup.mp3');
          bonusPickup.volume = .1;
          bonusPickup.load();
          pool[i] = bonusPickup;
        } // for
        break;
    } // switch
  }; // init

  this.play = function() {
    if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
      pool[currSound].play();
    }
    currSound = (currSound + 1) % size;
  }; // play

  this.pause = function() {
    if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
      pool[currSound].pause();
    }
    currSound = (currSound + 1) % size;
  }; // pause
}; // SoundPool


var Sound = function() {
  this.laser = new SoundPool(15);
  this.laser.init('laser');

  this.asteroidExplosion = new SoundPool(10);
  this.asteroidExplosion.init('asteroidExplosion');

  this.shipExplosion = new SoundPool(3);
  this.shipExplosion.init('shipExplosion');

  this.bonusPickup = new SoundPool(6);
  this.bonusPickup.init('bonusPickup');

  this.gameMusic = new Audio('audio/game-music.mp3');
  this.gameMusic.volume = .15;
  this.gameMusic.loop = true;
  this.gameMusic.load();
}; // Sound
