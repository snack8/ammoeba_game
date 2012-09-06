/******************************************************************************/
/* Ammoeba Game as jQuery plugin                                              */
/*                                                                            */
/* Author: Reed Spool                                                         */
/*                                                                            */
/* To use:                                                                    */
/*   Link this file in                                                        */
/*   Call on some container element:                                          */
/*     $("<div>").ammoeba( { settings : 'map' } ).ammoeba('start');           */
/******************************************************************************/

(function ( $ ){ // Gives access to jQuery object, avoiding library collisions
    
    // Private static variables
    var serverInUse = "local" // when the time comes, replace with "remote" to use ajax instead
    var $gameCanvas;
    var gameBoard;

    var directions = { 'down'  : [0,  1],
		       'left'  : [-1, 0],
		       'up'    : [0, -1],
		       'right' : [1,  0] };

    var settings =  { 'cols'        : 20,
		      'rows'        : 20,
		      'height'      : 500,
		      'width'       : 500,
		      'delay'       : 300 };

    // Public methods
    var methods = {
	init : function (options) {
	    var $this = $(this);
	    var data  = $this.data('snakeGame');
	    
	    // Overwrite default settings with passed options
	    settings = $.extend( {}, settings, options);
	    
	    // If plugin is not yet initialized, build game and bind keyhandler
	    if ( ! data ) {
		

		// When it's time for the real server, this will stop happening
		if (serverInUse == "local") {
		    serverInit();
		}

		// Build game inside container
		buildGame($this);

		// Set a marker that plugin is initialized.
		$this.data('snakeGame' , 1);
	    } else {
                // If plugin already initialized, do nothing
	    }	    

	    return $this; // Maintain chainability
	},

	start : startGame,

	pause : function () { /*stub*/ }, // Pause Game!

	reset : function () { /*stub*/ }  // Reset Game!
    };
    
    // Creates plugin forealz
    $.fn.ammoeba = function( method ) {

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
	    attr("tabindex", '0').blur(methods.pause);

	$container.html("").append($gameCanvas);

	// Add keyhandlers
	$(document).keydown(keyHandler);

	// Get the first update!
        if (serverInUse = "local") {
	    gameBoard = serverUpdate();
	}

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


    /**
     * These functions (redraw(), drawBlank()) are all for painting the game
     **/

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

    


    /**
     * advance(), runner(), and startGame() are all for running the app
     **/
    function advance(t) {
	gameBoard = serverUpdate();

	redraw();
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

