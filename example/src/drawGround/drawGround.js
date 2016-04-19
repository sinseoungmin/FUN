

$(document).ready(function(){
    //window가 load 될때 Event Listener를 등록 하여 준다.
    window.addEventListener('load', InitEvent, false);

    var canvas, context, tool;
    var fixX, fixY, mouseX, mouseY;

    var walls = [];
    var corners = [];

    function InitEvent (){

      // Canvas 객체를 탐색 한다.
      canvas = document.getElementById('drawCanvas');
      if (!canvas) {
        alert('캔버스 객체를 찾을 수 없음');
        return;
      }

      if (!canvas.getContext) {
        alert(' Drawing Contextf를 찾을 수 없음');
        return;
      }

      // 2D canvas context를 가져 온다.
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

    // 마우스 이동을 추적 하여 그리기 작업을 수행 한다.
    function tool_pencil (){

        var tool = this;
        this.started = false;

        this.mousedown = function (ev){
          fixX = ev._x;
          fixY = ev._y;

          //처음 눌림
          if(!tool.started){


          }
          else{


          }
        };

        // 마우스가 이동 할때(mousemove) 마다 호출 된다.
        this.mousemove = function (ev){
          mouseX = ev._x;
          mouseY = ev._y;

          //클릭 된 상태
          if (tool.started){
            redraw();
          }
        };
    }

    // Canvas요소 내의 좌표를 결정 한다.
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

    function redraw (){
      context.clearRect(0,0,canvas.width, canvas.height);
      drawLine(fixX,fixY,mouseX,mouseY );
    }

    function drawLine(startX, startY, endX, endY){
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.lineWidth = 5;
      context.strokeStyle = '#393969';
      context.stroke();
    }
});
