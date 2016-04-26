var utils = require('../util2')

$(document).ready(function(){

  //settings ------------------------------
  var color = '#ffa500';
  var roomColor = '#8afcff';
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
    this.corners = corners;
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



  //undomanager --------------------------
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


      this.mousedown = function (ev){

        //기존에 있는 corner나 wall와 거리가 가까울 때 해당 코너로 인식
        utils.forEach(corners,function(c){
          if(Math.abs(c.x - ev._x) < tolerance){
            ev._x = c.x;
          }
          if(Math.abs(c.y - ev._y) < tolerance){
            ev._y = c.y;
          }
        });
        utils.forEach(walls,function(w){
          if(utils.pointDistanceFromLine(ev._x, ev._y, w) < tolerance ){
            var point = utils.closestPointOnLine(ev._x, ev._y, w);
            ev._x = point.x;
            ev._y = point.y;
          }
        });

        //첫 클릭인지 확인
        if(!self.started){
          fixX = ev._x;
          fixY = ev._y;

          self.started = true;
        }
        else{
          //같은 위치 두 번 클릭할 경우 그리기 종료
          if(Math.abs(fixX - ev._x) < tolerance && Math.abs(fixY - ev._y) < tolerance){
            self.started = false;
            mouseX = '';
            mouseY = '';
            draw();
          }
          else{

            //corner1 = (fix), corner2 =(ev)
            var isInArr1 = $.grep(corners, function(e){
                return  e.x == fixX && e.y == fixY
            });
            var isInArr2 = $.grep(corners, function(e){
                return  e.x == ev._x && e.y == ev._y
            });

            // console.log(isInArr1);
            // console.log(isInArr2);

            if(isInArr1.length == 0 && isInArr2.length == 0){
              //corner1, corner2 둘 다 새로운 점인 경우
              console.log('case1');

              var corner1 = new Corner(fixX,fixY);
              var corner2 = new Corner(ev._x,ev._y);
              corners.push(corner1);
              corners.push(corner2);

              adjList.push([corner1,[corner2]]);
              adjList.push([corner2,[corner1]]);

              var wall = new Wall(corner1,corner2);
              walls.push(wall);

            }
            else if(isInArr1.length > 0 && isInArr2.length == 0){
              //corner1은 기존에 있었고, corner2는 새로운 점인 경우
              console.log('case2');

              corner2 = new Corner(ev._x,ev._y);
              corners.push(corner2);

              var idx = adjListIdx(isInArr1[0])
              adjList[idx][1].push(corner2);
              adjList.push([corner2,[isInArr1[0]]]);

              wall = new Wall(isInArr1[0],corner2);
              walls.push(wall);

            }
            else if(isInArr1.length == 0 && isInArr2.length > 0){
              //corner2는 기존에 있었고, corner1은 새로운 점인 경우
              console.log('case3');

              var corner1 = new Corner(fixX,fixY);
              corners.push(corner1);

              var idx = adjListIdx(isInArr2[0])
              adjList[idx][1].push(corner1);
              adjList.push([corner1,[isInArr2[0]]]);

              var wall = new Wall(corner1,isInArr2[0]);
              walls.push(wall);


            }
            else{
              //corner1, corner2 둘 다 기존에 있던 점인 경우
              console.log('case4');

              //corner1 adj에 corner2 추가
              var idx = adjListIdx(isInArr1[0])
              adjList[idx][1].push(isInArr2[0]);

              //corner2 adj에 corner1 추가
              idx = adjListIdx(isInArr2[0])
              adjList[idx][1].push(isInArr1[0]);

              var wall = new Wall(isInArr1[0],isInArr2[0]);
              walls.push(wall);

            }

            console.log(adjList);

            //시작점을 현재 위치로
            fixX = ev._x;
            fixY = ev._y;


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

      }

      this.mousemove = function (ev){
        //console.log(self.started);
        mouseX = ev._x;
        mouseY = ev._y;

        //클릭 된 상태
        if (self.started){
          draw();
        }
      }


      //esc 누르면 그리기 끝냄
      $(document).keyup(function(e){
        if(e.keyCode == 27){
          self.started = false;
          mouseX = '';
          mouseY = '';
          draw();
        }
      });
  }


  //좌표 설정
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


  //그리기 함수
  function draw (){
    context.clearRect(0,0,canvas.width, canvas.height);
    utils.forEach(corners,drawCorner);
    utils.forEach(walls,drawWall);
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
    context.fillStyle = roomColor;
    context.fill();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
  }


  //find room!!
  function findRoom(path){

    //now가 가장 마지막 corner 객체
    var now = path.slice(-1);
    var idx = adjListIdx(now);

    for(var i=0; i < adjList[idx][1].length; i++){
      path.push(adjList[idx][1][i]);
      findRoom(path);
    }

  }

});
