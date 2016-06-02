var SoundPool = function(maxSize, host) {
  var size = maxSize;
  var pool = [];
  var currSound = 0;

  this.pool = pool;

  this.init = function(sound) {
    switch (sound) {
      case 'laser':
        for (var i = 0; i < size; i++) {
          var laser = new Audio('http://' + host + '/audio/laser.mp3');
          laser.volume = .12;
          laser.load();
          pool[i] = laser;
        } // for
        break;

      case 'asteroidExplosion':
        for (var i = 0; i < size; i++) {
          var asteroidExplosion = new Audio('http://' + host + '/audio/asteroid-explosion.mp3');
          asteroidExplosion.volume = .06;
          asteroidExplosion.load();
          pool[i] = asteroidExplosion;
        } // for
        break;

      case 'shipExplosion':
        for (var i = 0; i < size; i++) {
          var shipExplosion = new Audio('http://' + host + '/audio/ship-explosion.mp3');
          shipExplosion.volume = .1;
          shipExplosion.load();
          pool[i] = shipExplosion;
        } // for
        break;

      case 'bonusPickup':
        for (var i = 0; i < size; i++) {
          var bonusPickup = new Audio('http://' + host + '/audio/bonus-pickup.mp3');
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


var Sound = function(host) {

  this.laser = new SoundPool(15, host);
  this.laser.init('laser');

  this.asteroidExplosion = new SoundPool(10, host);
  this.asteroidExplosion.init('asteroidExplosion');

  this.shipExplosion = new SoundPool(3, host);
  this.shipExplosion.init('shipExplosion');

  this.bonusPickup = new SoundPool(6, host);
  this.bonusPickup.init('bonusPickup');

  this.gameMusic = new Audio('audio/game-music.mp3');
  this.gameMusic.volume = .15;
  this.gameMusic.loop = true;
  this.gameMusic.load();

  /*this.gameOverAudio = new Audio("sounds/game_over.wav");
  this.gameOverAudio.loop = true;
  this.gameOverAudio.volume = .25;
  this.gameOverAudio.load();*/
  //this.checkAudioInterval = window.setInterval(this.checkAudioReady, 1000);
}; // Sound
