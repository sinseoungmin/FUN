var utils = require('../util2')

$(document).ready(function(){


  //settings ------------------------------
  var color = '#ffa500';
  var radius = 5;
  var lineWidth = 5;
  var fillColor = color;
  var tolerance = 10;

  //adjList에서 해당 corner 객체의 index를 가져옴.
  function adjListIdx(corner){
    var idx = -1;
    for(var i=0; i<adjList.length; i++){
      if(adjList[i][0].id == corner.id ){
        idx = i;
      }
    }
    return idx;
  }


  //클래스: corner, wall, room ---------------
  var Corner = function(x,y){
    this.x = x;
    this.y = y;
    this.id = utils.guid();
  }
  //start,end 는 corner 객체
  var Wall = function(start,end){
    this.start = start;
    this.end = end;
    this.id = [start.id, end.id].join();
  }
  //corners는 corner 객체들의 배열
  var Room = function(corners){
    this.color = '#'+utils.randHexColor();
    this.corners = corners;
    this.area = utils.polygonArea(corners);

    var id = [];
    for(var i=0; i<corners.length;i++){
      id.push(corners[i].id);
    }
    this.idArr = id;
    this.idText = id.join();

    //for checking isInRooms
    var sortId = id.slice();
    sortId.sort();
    this.sortId = sortId.join();

  }


  //window가 load 될때 Event Listener를 등록 하여 준다.
  window.addEventListener('load', InitEvent, false);

  var self = this;
  this.started = false;

  var canvas, context, tool;
  var fixX, fixY, mouseX, mouseY;

  var corners = [];
  var walls = [];

  var adjList = [];
  var rooms = [];


  /* undomanager --------------------------
    var undoManager = new UndoManager();

    $('#undoB').click(function(){
      undoManager.undo();
      self.started = false;
      mouseX = '';
      mouseY = '';
      draw();
    });
    $('#redoB').click(function(){
      undoManager.redo();
      self.started = false;
      mouseX = '';
      mouseY = '';
      draw();
    });
  */


  function InitEvent (){

    canvas = document.getElementById('drawCanvas');
    if (!canvas) {
      alert('캔버스 객체를 찾을 수 없음');
      return;
    }
    if (!canvas.getContext) {
      alert(' Drawing Contextf를 찾을 수 없음');
      return;
    }
    context = canvas.getContext('2d');
    if (!context) {
      alert('getContext() 함수를 호출 할 수 없음');
      return;
    }

    tool = new tool_pencil();

    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);

  }

  // 마우스 이동을 추적 하여 그리기 작업을 수행
  function tool_pencil (){

      var tool = this;


      this.mousedown = function (mdev){

        //기존에 있는 corner나 wall와 거리가 가까울 때 해당 코너로 인식
        var nearCorner = false;

        utils.forEach(corners,function(c){
          if(Math.abs(c.x - mdev._x) < tolerance && Math.abs(c.y - mdev._y) < tolerance ){
            mdev._x = c.x;
            mdev._y = c.y;

            nearCorner = true;
          }
        });
        if(!nearCorner){
          utils.forEach(walls,function(w){
            if(utils.pointDistanceFromLine(mdev._x, mdev._y, w) < tolerance ){
              var point = utils.closestPointOnLine(mdev._x, mdev._y, w);
              mdev._x = point.x;
              mdev._y = point.y;
            }
          });
        }


        //첫 클릭인지 확인
        if(!self.started){
          fixX = mdev._x;
          fixY = mdev._y;

          self.started = true;
        }
        else{
          //같은 위치 두 번 클릭할 경우 그리기 종료
          if(Math.abs(fixX - mdev._x) < tolerance && Math.abs(fixY - mdev._y) < tolerance){
            self.started = false;
            mouseX = '';
            mouseY = '';
            draw();
          }
          else{

            //corner1 = (fix), corner2 =(mdev)
            var isInArr1 = $.grep(corners, function(e){
                return  e.x == fixX && e.y == fixY
            });
            var isInArr2 = $.grep(corners, function(e){
                return  e.x == mdev._x && e.y == mdev._y
            });


            if(isInArr1.length == 0 && isInArr2.length == 0){
              //corner1, corner2 둘 다 새로운 점인 경우

              var corner1 = new Corner(fixX,fixY);
              var corner2 = new Corner(mdev._x,mdev._y);
              corners.push(corner1);
              corners.push(corner2);

              adjList.push([corner1,[corner2]]);
              adjList.push([corner2,[corner1]]);

              var wall = new Wall(corner1,corner2);
              walls.push(wall);

              findRoom([corner1, corner2]);
            }
            else if(isInArr1.length > 0 && isInArr2.length == 0){
              //corner1은 기존에 있었고, corner2는 새로운 점인 경우

              corner2 = new Corner(mdev._x,mdev._y);
              corners.push(corner2);

              var idx = adjListIdx(isInArr1[0])
              adjList[idx][1].push(corner2);
              adjList.push([corner2,[isInArr1[0]]]);

              wall = new Wall(isInArr1[0],corner2);
              walls.push(wall);

              findRoom([isInArr1[0],corner2]);
            }
            else if(isInArr1.length == 0 && isInArr2.length > 0){
              //corner2는 기존에 있었고, corner1은 새로운 점인 경우
              utils.consoleLog('case3');

              var corner1 = new Corner(fixX,fixY);
              corners.push(corner1);

              var idx = adjListIdx(isInArr2[0])
              adjList[idx][1].push(corner1);
              adjList.push([corner1,[isInArr2[0]]]);

              var wall = new Wall(corner1,isInArr2[0]);
              walls.push(wall);

              findRoom([corner1,isInArr2[0]]);
            }
            else{
              //corner1, corner2 둘 다 기존에 있던 점인 경우

              //corner1 adj에 corner2 추가
              var idx = adjListIdx(isInArr1[0])
              adjList[idx][1].push(isInArr2[0]);

              //corner2 adj에 corner1 추가
              idx = adjListIdx(isInArr2[0])
              adjList[idx][1].push(isInArr1[0]);

              var wall = new Wall(isInArr1[0],isInArr2[0]);
              walls.push(wall);

              findRoom([isInArr1[0],isInArr2[0]]);

            }

            utils.consoleLog(corners);
            utils.consoleLog(adjList);
            utils.consoleLog(rooms);

            //시작점을 현재 위치로
            fixX = mdev._x;
            fixY = mdev._y;


            /* undomanager 일단 보류
              //undoManager 변수
              var c1 = corners[corners.length-2];
              var c2 = corners[corners.length-1];
              var w  = walls[walls.length-1];

              undoManager.add({
                undo:function(){
                  if(corners.length == 2){
                    corners.splice(0,2);
                  }
                  else{
                    corners.splice(corners.length-1,1);
                  }
                  walls.splice(walls.length-1,1);
                },
                redo:function(){
                  if(corners.length == 0){
                    corners.push(c1);
                    corners.push(c2);
                  }
                  else{
                    corners.push(c2);
                  }

                  walls.push(w);
                }
              });
            */

          }
        }

        draw();

        console.log(rooms);
      }

      this.mousemove = function (ev){
        //utils.consoleLog(self.started);
        mouseX = ev._x;
        mouseY = ev._y;

        //클릭 된 상태
        if (self.started){
          draw();
        }
      }


      //esc -> ends draw mode
      $(document).keyup(function(e){
        if(e.keyCode == 27){
          self.started = false;
          mouseX = '';
          mouseY = '';
          draw();
        }
      });
  }


  //coordinate setting
  function ev_canvas (ev){
      if (ev.layerX || ev.layerX == 0){
        // Firefox 브라우저
        ev._x = ev.layerX;
        ev._y = ev.layerY;
      }
      else if (ev.offsetX || ev.offsetX == 0){
        // Opera 브라우저
        ev._x = ev.offsetX;
        ev._y = ev.offsetY;
      }

      var func = tool[ev.type];
      if (func){
          func(ev);
      }
  }


  //draw functions ------------------------------------------
  function draw (){
    context.clearRect(0,0,canvas.width, canvas.height);
    utils.forEach(corners,drawCorner);
    utils.forEach(walls,drawWall);
    utils.forEach(rooms,drawRoom);
    if(!!self.started){
      drawLine(fixX,fixY,mouseX,mouseY );
    }
  }

  function drawLine(startX, startY, endX, endY){
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
  }

  function drawWall(wall){
    context.beginPath();
    context.moveTo(wall.start.x, wall.start.y);
    context.lineTo(wall.end.x, wall.end.y);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
  }

  function drawCorner(corner) {
    context.beginPath();
    context.arc(corner.x, corner.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
  }

  function drawRoom(room){
    var corners = room.corners;
    context.beginPath();
    context.moveTo(corners[0].x, corners[0].y);
    for (var i = 1; i < corners.length; i++){
      context.lineTo(corners[i].x,corners[i].y);
    }
    context.closePath();
    context.fillStyle = room.color;
    context.fill();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
  }


  //find room functions ---------------------------------------

  //cArr is consist of corner objects
  function findRoom(cArr){
    var path =[];
    for(var i=0; i< cArr.length; i++){
      path.push(cArr[i]);
      findPath(path);
      path = [];
    }
  }

  function findPath(path){

    var now = path.slice(-1);
    var idx = adjListIdx(now[0]);

    if(idx == -1){
      utils.consoleLog('no adjcorners');
      return;
    }
    else{
      var adjCorners = adjList[idx][1].slice();


      for(var i =0; i < adjCorners.length; i++){

        //new corner
        if(path.indexOf(adjCorners[i]) < 0  ){

          path.push(adjCorners[i]);
          findPath(path);

          utils.consoleLog('comeback!');
          path.splice(path.length-1,1);

        }
        else if(path.indexOf(adjCorners[i]) == 0 && path.length > 2){
          var pathCopy = path.slice();

          //check already in rooms(same corner, different order)
          if(!isInRooms(pathCopy)){

            //make path clockwise-order
            var cwPath = [];
            if(!utils.isClockwise(pathCopy)){
              cwPath.push(pathCopy[0]);
              for(var j=1; j<pathCopy.length; j++){
                cwPath.push(pathCopy[pathCopy.length-j]);
              }
            }
            else{
              cwPath = pathCopy.slice();
            }

            utils.consoleLog('cwpath');
            utils.consoleLog(cwPath);

            //is there room with same angle?
            var total = checkByAngle(cwPath);

            if(!total[0]){
              //new angle!!
              var room = new Room(cwPath);
              rooms.push(room);
            }
            else{
              //existing angle
              if(!total[1]){
                //smaller polygon, so remove exist room and make new room
                utils.removeArrByIdxs(total[2],rooms);

                var room = new Room(cwPath);
                rooms.push(room);
              }
              else{
                //bigger polygon
              }
            }

          }
          else{
            utils.consoleLog('this path is already in the rooms');
          }

        }
        else{
          utils.consoleLog('visited corner');
        }

      }

      return;

    }

  }

  function isInRooms(path){
    var check = false
    var sortId = [];

    for(var i=0; i<path.length;i++){
      sortId.push(path[i].id);
    }
    sortId.sort();

    for(var i=0; i<rooms.length; i++){
      if(sortId == rooms[i].sortId) check = true;
    }

    return check;
  }

  function checkByAngle(path){
    var hasSameAngle = false;
    var isBigger = false;
    var rmIdxs = [];

    for(var i=0; i<rooms.length; i++){
      var idArr = rooms[i].idArr;

      jLoop:
      for(var j=0; j<idArr.length; j++){

        var id1 = idArr[j];
        if(j==idArr.length-2){
          var id2 = idArr[j+1];
          var id3 = idArr[0];
        }
        else if(j==idArr.length-1){
          var id2 = idArr[0];
          var id3 = idArr[1];
        }
        else{
          var id2 = idArr[j+1];
          var id3 = idArr[j+2];
        }

        for(var k=0; k<path.length; k++){

          var p1 = path[k];
          if(k == path.length-2){
            var p2 = path[k+1];
            var p3 = path[0];
          }
          else if(k == path.length-1){
            var p2 = path[0];
            var p3 = path[1];
          }
          else{
            var p2 = path[k+1];
            var p3 = path[k+2];
          }

          //three connected corner(angle) is same
          if(id1 == p1.id && id2 == p2.id && id3 == p3.id){
            utils.consoleLog('angle:' + id1 + id2 + id3);
            hasSameAngle = true;

            //compare area between existing room and new path
            if(rooms[i].area >= utils.polygonArea(path)){
              rmIdxs.push(i);
            }
            else{
              isBigger = true;
            }

            break jLoop;
          }

        }//k
      }//j
    }//i

    var total = [hasSameAngle, isBigger, rmIdxs];
    return total;
  }

});
