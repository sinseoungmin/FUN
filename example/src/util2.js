var utils = {};

utils.forEach = function(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(array[i]);
  }
}

utils.removeArrByIdxs = function(rmIdxs,array){
  rmIdxs.sort();
  for(var i = 0;i < rmIdxs.length; i++){
    var rmIdx = rmIdxs[i] - i;
    array.splice(rmIdx,1);
  }

  return array;
}

//고유 id 생성 (연습용 1~n)
/*
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
*/
utils.number = 0;
utils.guid = function(){
  utils.number += 1;
  return utils.number;
}


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

utils.randKey = function(num){
  var arraySet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','W','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9']
  var rN = '';
  for(var i=0; i<num; i++){
    var randIndex = Math.floor(Math.random()*arraySet.length);
    rN += arraySet[randIndex];
  }
  return rN
}

utils.randHexColor = function(){
  var arraySet = ['a','b','c','d','e','f','0','1','2','3','4','5','6','7','8','9']
  var rN = '';
  for(var i=0; i<6; i++){
    var randIndex = Math.floor(Math.random()*arraySet.length);
    rN += arraySet[randIndex];
  }
  return rN
}

utils.map = function(array, func) {
  var result = [];
  utils.forEach(array, function (element) {
    result.push(func(element));
  });
  return result;
}

// points is array of points with x,y attributes
utils.isClockwise = function( points ) {
    // make positive
    var subX = Math.min(0, Math.min.apply(null, utils.map(points, function(p) {
      return p.x;
    })))
    var subY = Math.min(0, Math.min.apply(null, utils.map(points, function(p) {
      return p.x;
    })))
    var newPoints = utils.map(points, function(p) {
      return {
        x: p.x - subX,
        y: p.y - subY
      }
    })

    // determine CW/CCW, based on:
    // http://stackoverflow.com/questions/1165647
    // update(2016.5.2): sum <=0 --> clockwise
    var sum = 0;
    for ( var i = 0; i < newPoints.length; i++ ) {
        var c1 = newPoints[i];
        if (i == newPoints.length-1) {
            var c2 = newPoints[0]
        } else {
            var c2 = newPoints[i+1];
        }
        sum += (c2.x - c1.x) * (c2.y + c1.y);
    }
    return (sum <= 0);
}




utils.consoleLog = function(a){
  //console.log(a);
}

module.exports = utils;
