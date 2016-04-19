

$(document).ready(function(){

  //settings
  var color = '#ffa500';
  var radius = 5;
  var fillColor = color;


  //공통 함수
  function forEach(array, action) {
    for (var i = 0; i < array.length; i++) {
      action(array[i]);
    }
  }


  //클래스: corner, wall
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

        //처음 누를 때
        if(!self.started){
          fixX = ev._x;
          fixY = ev._y;

          self.started = true;
        }
        else{          
          corner1 = new Corner(fixX,fixY);
          corner2 = new Corner(ev._x,ev._y);
          wall = new Wall(corner1,corner2);

          var flag = corners.indexOf(corner1);
          if(flag == -1){
            corners.push(corner1);
          }
          corners.push(corner2);
          walls.push(wall);

          fixX = ev._x;
          fixY = ev._y;
        }
      }

      // 마우스가 이동 할때(mousemove) 마다 호출 된다.
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
