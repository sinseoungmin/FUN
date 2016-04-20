
$(document).ready(function(){

  //settings ------------------------------
  var color = '#ffa500';
  var radius = 5;
  var fillColor = color;
  var tolerance = 10;


  //공통 함수 --------------------------------
  function forEach(array, action) {
    for (var i = 0; i < array.length; i++) {
      action(array[i]);
    }
  }

  function distance( x1, y1, x2, y2 ) {
  	return Math.sqrt(
  		Math.pow(x2 - x1, 2) +
  		Math.pow(y2 - y1, 2));
  }
  function closestPointOnLine(x, y, wall) {
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
  function pointDistanceFromLine( x, y, wall ) {
    var point = closestPointOnLine(x, y, wall);
  	return distance(x,y,point.x,point.y);
  }


  //클래스: corner, wall ---------------------
  var Corner = function(x,y){
    this.x = x;
    this.y = y;
  }
  //start,end 는 corner 객체
  var Wall = function(start,end){
    this.start = start;
    this.end = end;
  }


  //window가 load 될때 Event Listener를 등록 하여 준다.
  window.addEventListener('load', InitEvent, false);

  var self = this;
  this.started = false;

  var canvas, context, tool;
  var fixX, fixY, mouseX, mouseY;

  var corners = [];
  var walls = [];


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


    // tool_pencil 함수의 인스턴스를 생성 한다.
    tool = new tool_pencil();

    // Canvas에 mousedown, mousemove, mouseup 이벤트 리스너를 추가한다.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);

  }

  // 마우스 이동을 추적 하여 그리기 작업을 수행
  function tool_pencil (){

      var tool = this;

      this.mousedown = function (ev){

        //기존에 있는 corner나 wall와 거리가 가까울 때 해당 코너로 인식
        forEach(corners,function(c){
          if(Math.abs(c.x - ev._x) < tolerance){
            ev._x = c.x;
          }
          if(Math.abs(c.y - ev._y) < tolerance){
            ev._y = c.y;
          }
        });
        forEach(walls,function(w){
          if(pointDistanceFromLine(ev._x, ev._y, w) < tolerance ){
            var point = closestPointOnLine(ev._x, ev._y, w);
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
            corner1 = new Corner(fixX,fixY);
            corner2 = new Corner(ev._x,ev._y);
            wall = new Wall(corner1,corner2);


            //corner1 관련, 처음 찍는 corner가 기존에 있는지 없는지 check
            var isInArr = $.grep(corners, function(e){
                return  e.x == corner1.x && e.y == corner1.y
            });
            if(isInArr.length == 0){
              corners.push(corner1);
            }


            //corner2 관련
            corners.push(corner2);
            walls.push(wall);

            fixX = ev._x;
            fixY = ev._y;


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
    forEach(corners,drawCorner);
    forEach(walls,drawWall);
    if(!!self.started){
      drawLine(fixX,fixY,mouseX,mouseY );
    }
  }

  function drawLine(startX, startY, endX, endY){
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
  }

  function drawWall(wall){
    context.beginPath();
    context.moveTo(wall.start.x, wall.start.y);
    context.lineTo(wall.end.x, wall.end.y);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
  }

  function drawCorner(corner) {
    context.beginPath();
    context.arc(corner.x, corner.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
  }

});
