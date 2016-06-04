'use strict';
(function() {
  var DOMLoaded = function() {

    var stars;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;


    var setCanvasFullSize = function() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      requestAnimationFrame(drawBg);
    }; // setCanvasFullSize


    var drawBg = function() {

      var nbStars1 = 500;
      var stars1 = [];

      for(var i = 0; i < nbStars1; i++ ) {
        var star = new Star({
          width: width,
          height: height,
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
          width: width,
          height: height,
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
          width: width,
          height: height,
          radius: Math.random() * 2.5,
          x: Math.random() * width,
          y: Math.random() * height,
          direction: Math.PI * 1.5,
          speed: 1,
          color: '#fff'
        });
        stars3.push(star);
      }

      stars = stars1.concat(stars2, stars3);
    }; // drawBg


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

    drawBg();
    renderLoop();



    var windowResizeHandler = function() {
      setCanvasFullSize();
    } // windowResizeHandler
    window.addEventListener('resize', windowResizeHandler);


    document.getElementById('play-asteroids').addEventListener('click', function() {
      window.location = '/';
    });

  } // DOMLoaded

  window.addEventListener('DOMContentLoaded', DOMLoaded);
}());
