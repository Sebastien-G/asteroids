// Simple GET XMLHttpRequest
var ajaxGet = function(url, json, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var res = (json) ? JSON.parse(request.responseText) : request.responseText;
      callback(res);
    } else {

    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();
}; // ajaxGet
