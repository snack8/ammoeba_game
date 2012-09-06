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
    var timeoutID;
    var curDir = "down";
    var gamePaused = false;
    

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

	start   : startGame,

	pause   : pauseGame, // Should Pause Game!
	unpause : unPauseGame // Should unpause (only when paused)
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

    // Private (to the plugin) functions follow
    function buildGame($container) {
        var h = settings["height"];
	var w = settings["width"];
	var c = settings["cols"];
	var r = settings["rows"];



	$gameCanvas = $("<canvas>").attr("height", h).attr("width",  w).
	    attr("tabindex", '0').blur(methods.pause).focus(methods.unpause);

	$container.html("").append($gameCanvas);

	// Add keyhandlers
	$(document).keydown(keyHandler);

	// Get the first update!
        if (serverInUse = "local") {
	    redraw(serverUpdate());
	}
    }
    
    function keyHandler(e) {
	var dir = curDir;
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
	
	curDir = dir;
	return dir;
    }


    /**
     * These functions (redraw(), drawBlank()) are all for painting the game
     **/

    function redraw(gameBoard) {
        var h = settings["height"];
	var w = settings["width"];
	var c = settings["cols"];
	var r = settings["rows"];

	$gameCanvas.clearCanvas();

	for(var i = 1; i < r - 1; i++) {
	    for(var j = 1; j < c - 1; j++) {
		var x = (w/c) * j;
		var y = (h/r) * i;
		$gameCanvas.drawText({
			strokeStyle: "#1f1",
			    x: x,
			    y: y,
			    text: gameBoard[i][j] % 10,
			    fromCenter: false,
			    rotate: 10 });
	    }
	}
	
	
    }

    function drawEmpty($can, _x, _y, w) {
	$can.drawRect({ strokeStyle: "#CCCCFF",
		    x: _x, y: _y, 
		    width: settings["width"]/settings["cols"],
		    height: settings["height"]/settings["rows"],
		    fromCenter: false });
		    
    }




    /**
     * advance(), runner(), and startGame() are all for running the app
     **/
    function advance() {
	redraw(serverUpdate());
    }
    
    function startGame() {
	timeoutID = setInterval(advance, settings['delay']);
    }

    function pauseGame() {
	gamePaused = true;
	clearInterval(timeoutID);
	$gameCanvas.clearCanvas().drawText({
		strokeStyle: "#1f1",
		    x: settings["width"]/3,
		    y: settings["height"]/3,
		    text: "Paused!",
		    fromCenter: false,
		    rotate: 20 });
    }

    function unPauseGame() {
	if (gamePaused) {
	    startGame();
	    gamePaused = false;
	}

    }




    // END Private Functions
})( jQuery );

