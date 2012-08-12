// Plugin version of snakeGame. Call on singular element:
//   $("singleDOMElement").snakeGame( { settings : 'map' } );
(function ( $ ){ 

    var methods = {
	init : function (options) {
	    
	},
	
    }
    
    
    $.fn.snakeGame = function( settings ) {
	
	
	var options = $.extend( {
		'width'      : 50,
		'height'     : 20,
		'empty_rep'  : '_',
		'snake_rep'  : 's',
		'apple_rep'  : '@',
		'next_dir'   : 'down',
		'cur_y'      : 5,
		'cur_x'      : 5 }, settings );
	
    };
})( jQuery );


$EMPTY_FIELD = "_";
$SNAKE_FIELD = "s";
$APPLE_FIELD = "@";
$NEXT_DIR    = "down";
$CUR_Y       = 5;
$CUR_X       = 5;

function buildGame(container, height, width) {
  container = $(container);
  var wrap = $("<div>");

  // Build the field
  for(var i = 0; i < height; i++) {
      for(var j = 0; j < width; j++) {
	  wrap.append( $("<span>").attr("x", j).attr("y", i).html($EMPTY_FIELD) );
      }
      wrap.append( $("<br />") );
  }
   
  // Add field to container, and add key events
  container.append(wrap.contents()).keydown(keyHandler);
}

function keyHandler(e) {
    var dir = "";
    switch(e.keyCode) {
    case 37: // Left Arrow
	dir = "left";
	break;
    case 38: // Up Arrow
	dir = "up";       
	break;
    case 39: // Right Arrow
	dir = "right";
	break;
    case 40: // Down Arrow
	dir = "down";
	break;
    }
   
    $NEXT_DIR = dir;
}

function moveHead() {
    var next;
    switch($NEXT_DIR) {
    case "left":
	next = [-1, 0];
	break;
    case "up":
	next = [0, -1];
	break;
    case "right":
	next = [1, 0];
	break;
    case "down":
	next = [0, 1];
	break;
    }
    $CUR_X += next[0];
    $CUR_Y += next[1];
    change($CUR_X, $CUR_Y, $SNAKE_FIELD);
}

function advance(t) {
    moveHead();// Move head
    // Erase tail if not digesting
}

function runner(delay, t) {
  t = t || 0;
  advance(t);
  var timeoutID = window.setTimeout(runner, delay, delay, t + 1);
}

function startGame() {
    runner(600);
}

function change(x, y, val) {
    var el = $("span[x='"+x+"']").filter("[y='"+y+"']");
    var prev = el.html();
    el.html(val);
    return prev;
}

// ONREADY FUNC
$(function (){

  buildGame("#gameContainer", 20,20);

  $("#form").keydown(keyHandler).focus();

  startGame();

});