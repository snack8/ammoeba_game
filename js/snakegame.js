/******************************************************************************/
/* Snake Game as jQuery plugin                                                */
/*                                                                            */
/* Author: Reed Spool                                                         */
/*                                                                            */
/* To use:                                                                    */
/*   Link this file in                                                        */
/*   Call on some container element:                                          */
/*     $("<div>").snakeGame( { settings : 'map' } ).snakeGame('start');       */
/******************************************************************************/

(function ( $ ){ // Gives access to jQuery object, avoiding library collisions
    
    // Private static variables
    var $gameCanvas;
    var gameBoard;

    var directions = { 'down'  : [0,  1],
		       'left'  : [-1, 0],
		       'up'    : [0, -1],
		       'right' : [1,  0] };

    var settings =  { 'rows'        : 20,
		      'cols'        : 20,
		      'height'      : 500,
		      'width'       : 500,
		      'delay'       : 300,
		      'appleLength' : 5,
		      'startLength' : 5 };

    var gameState = { 'nextDir'     : 'down',
		      'curY'        : 5,
		      'curX'        : 5,
		      'curLength'   : settings['startLength'],
		      'digesting'   : 0 };

	
    // Public methods
    var methods = {
	init : function (options) {
	    var $this = $(this);
	    var data  = $this.data('snakeGame');
	    
	    // Overwrite default settings with passed options
	    settings = $.extend(settings, options);
	    
	    // If plugin is not yet initialized, build game and bind keyhandler
	    if ( ! data ) {
		
		// Build game inside container
		buildGame($this);
		$this.data('snakeGame' , 1);

	    }
	    // If plugin unitialized, do nothing
	    return $this; // Maintain chainability
	},
	start : startGame,
	pause : function () { /*stub*/ }, // Pause Game!
	reset : function () { /*stub*/ }  // Reset Game!
    };
    
    // Creates plugin forealz
    $.fn.snakeGame = function( method ) {

	// Method calling logic.
	if ( methods[method] ) {
	    return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if (typeof method === 'object' || ! method ) {
	    return methods.init.apply(this, arguments );
	} else {
	    $.error( 'Method ' + method + 
		     ' does not exist on jQuery.snakeGame' );
	}
    };

    // Private functions follow
    function buildGame($container) {
        var h = settings["height"];
	var w = settings["width"];
	var c = settings["cols"];
	var r = settings["rows"];

	$gameCanvas = $("<canvas>").attr("height", h).attr("width",  w).
	    attr("tabindex", '0').
	    css("border", "solid 1px #113C10").
	    blur(function(){alert("blurred");});

	$container.html("").append($gameCanvas);

	// Add keyhandlers
	$(document).keydown(keyHandler);

	// build the game model
	gameBoard = new Array(r);

	for(var i = 0; i < r; i++) {
	    gameBoard[i] = new Array(c);
	    for(var j = 0; j < c; j++) {
		gameBoard[i][j] = 0;
	    }
	}

	// Stamp head and apple
	makeApple();
	gameBoard[gameState['curY']][gameState['curX']] = gameState['curLength'];
	
	redraw();
    }
    
    function keyHandler(e) {
	var dir = gameState['nextDir'];
	var code = e ? e.keyCode : -1;
	switch(code) {
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
	
	gameState['nextDir'] = dir;
    }

    function moveHead() {
	var next = directions[gameState['nextDir']];
	var x = gameState['curX'] + next[0];
	var y = gameState['curY'] + next[1];

	gameState['curX'] = x;
	gameState['curY'] = y;
	
	ahead = gameBoard[y][x];
	if (ahead == undefined || ahead > 0) {
	    // FIXME: DEAD
	} else if (ahead == -1) {
	    // Hit Apple
	    makeApple();
	    gameState['digesting'] += settings['appleLength'];
	}
	
	gameBoard[y][x] = gameState['curLength'];
    }
    
    function advance(t) {
	var h = settings["height"];
	var w = settings["width"];
	var c = settings["cols"];
	var r = settings["rows"];

	moveHead();// Move head

	if (gameState['digesting'] > 0) {
	    gameState['digesting']--;
	    gameState['curLength']++;
	} else {
	    for (var i = 0; i < r; i++) {
		for (var j = 0; j < c; j++) {
                    if (gameBoard[i][j] > 0) {
			gameBoard[i][j]--;
		    }
		}
	    }
	}

	redraw();
    }
    
    function makeApple() {
	var c = settings["cols"];
	var r = settings["rows"];
	var new_x, new_y;

	do {
	    new_x = Math.floor(Math.random()*c) + 1;
	    new_y = Math.floor(Math.random()*r) + 1;
	} while (gameBoard[new_y][new_x] > 0);

	gameBoard[new_y][new_x] = -1;
    }

    function redraw() {
        var h = settings["height"];
	var w = settings["width"];
	var c = settings["cols"];
	var r = settings["rows"];

	$gameCanvas.clearCanvas();

	for(var i = 0; i < r; i++) {
	    for(var j = 0; j < c; j++) {
		var x = (w/c)*j;
		var y = (h/r)*i;
		if (gameBoard[i][j] > 0) {
		    drawSnake($gameCanvas, x, y);
		} else if (gameBoard[i][j] == 0) {
		    drawEmpty($gameCanvas, x, y);
		} else if (gameBoard[i][j] == -1) {
		    drawApple($gameCanvas, x, y);
		}
	    }
	}
	
	
    }

    function drawSnake($can, _x, _y) {
	$can.drawArc({ fillStyle: "black",
		    x: _x , y: _y, radius: settings["height"]/settings["rows"]/2, fromCenter:false });
    }


    function drawEmpty($can, _x, _y, w) {
	$can.drawRect({ strokeStyle: "#CCCCFF",
		    x: _x, y: _y, 
		    width: settings["width"]/settings["cols"],
		    height: settings["height"]/settings["rows"],
		    fromCenter: false });
		    
    }

    function drawApple($can, _x, _y) {
	$can.drawArc({ fillStyle: "#FF00FF",
		    x: _x , y: _y, radius: settings["height"]/settings["rows"]/2 });
    }

    function runner(delay, t) {
	t = t || 0; // begin time at zero
	advance(t);
	var timeoutID = window.setTimeout(runner, delay, delay, t + 1);
    }
    
    function startGame() {
	runner(settings['delay']);
    }
    // END Private Functions
})( jQuery );

