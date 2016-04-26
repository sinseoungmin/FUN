var utils = {};

utils.forEach = function(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(array[i]);
  }
}


//고유 id 생성
utils.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


//distance 관련 함수
utils.distance = function( x1, y1, x2, y2 ) {
	return Math.sqrt(
		Math.pow(x2 - x1, 2) +
		Math.pow(y2 - y1, 2));
}

utils.closestPointOnLine = function(x, y, wall) {
  var A = x - wall.start.x;
  var B = y - wall.start.y;
  var C = wall.end.x - wall.start.x;
  var D = wall.end.y - wall.start.y;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = dot / len_sq;

  var xx, yy;

  if (param < 0 || (wall.start.x == wall.end.x && wall.start.y == wall.end.y)) {
    xx = wall.start.x;
    yy = wall.start.y;
  } else if (param > 1) {
    xx = wall.end.x;
    yy = wall.end.y;
  } else {
    xx = wall.start.x + param * C;
    yy = wall.start.y + param * D;
  }

  return {
    x: xx,
    y: yy
  }
}

utils.pointDistanceFromLine = function( x, y, wall ) {
  var point = utils.closestPointOnLine(x, y, wall);
	return utils.distance(x,y,point.x,point.y);
}

module.exports = utils;
