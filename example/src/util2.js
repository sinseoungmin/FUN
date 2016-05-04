var utils = {};

utils.forEach = function(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(array[i]);
  }
}

utils.map = function(array, func) {
  var result = [];
  utils.forEach(array, function (element) {
    result.push(func(element));
  });
  return result;
}

utils.removeArrByIdxs = function(rmIdxs,array){
  var removedArr = [];

  rmIdxs.sort();
  for(var i = 0;i < rmIdxs.length; i++){
    var rmIdx = rmIdxs[i] - i;

    removedArr.push(array[rmIdx]);
    array.splice(rmIdx,1);
  }

  return removedArr;

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

utils.onTheCorner = function(x,y,corners,tolerance){
  var corner;
  utils.forEach(corners,function(c){
    if(Math.abs(c.x - x) < tolerance && Math.abs(c.y - y) < tolerance ){
      console.log('near corner');
      corner = c;
    }
  });
  return corner;
}

utils.onTheWall = function(x,y, walls, tolerance){
  var returnArr = [];
  utils.forEach(walls,function(w){
    if(utils.pointDistanceFromLine(x, y, w) < tolerance ){
      console.log('near wall');
      var point = utils.closestPointOnLine(x, y, w);
      returnArr[0] = w;
      returnArr[1] = point;
    }
  });
  return returnArr;
}

//adjList에서 해당 corner 객체의 index를 가져옴.
utils.adjListIdx = function(corner, adjList){
  var idx = -1;
  for(var i=0; i<adjList.length; i++){
    if(adjList[i][0].id == corner.id ){
      idx = i;
    }
  }
  return idx;
}

utils.adjIfOnTheWall = function(corner, adjList, walls, tolerance){
  var otw = utils.onTheWall(corner.x, corner.y, walls, tolerance);
  if(otw.length > 0){
    var idx1 = utils.adjListIdx(otw[0].start, adjList);
    var idx2 = utils.adjListIdx(otw[0].end, adjList);
    var idx3 = utils.adjListIdx(corner, adjList);

    adjList[idx1][1].push(corner);
    adjList[idx2][1].push(corner);
    adjList[idx3][1].push(otw[0].start,otw[0].end);

    console.log('adj리스트에 추가!!')
    console.log(adjList);
  }
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
    // sum <=0 --> clockwise
    var sum = 0;
    for ( var i = 0; i < newPoints.length; i++ ) {
        var c1 = newPoints[i];
        if (i == newPoints.length-1) {
            var c2 = newPoints[0];
        } else {
            var c2 = newPoints[i+1];
        }
        sum += (c2.x - c1.x) * (c2.y + c1.y);
    }
    return (sum <= 0);
}

utils.polygonArea = function(corners){
  var area = 0;

  for(var i=0; i<corners.length; i++){
    var c1 = corners[i];

    if(i == corners.length-1){
      var c2 = corners[0];
    }
    else{
      var c2 = corners[i+1];
    }

    area += (c1.x * c2.y) - (c1.y * c2.x);
  }

  return area/2;
}


utils.consoleLog = function(a){
  //console.log(a);
}

module.exports = utils;
