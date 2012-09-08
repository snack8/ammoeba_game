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
    var $myQueueCanvas;

    var gameBoard;
    var timeoutID;
    var curDir = "down";
    var gamePaused = false;
    var myQueue;    
    var queueElementCounter = 0;

    var settings =  { 'cols'        : 20,
		      'rows'        : 20,
		      'canHeight'   : 500,
		      'canWidth'    : 500,
		      'queueHeight' : 50,
		      'queueWidth'  : 500,
		      'queueLength' : 10,
		      'delay'       : 1000 };
    

    // end private static variables

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
	pause   : pauseGame,  // Should Pause Game!
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
        var h = settings['canHeight'];
	var w = settings['canWidth'];
	var c = settings["cols"];
	var r = settings["rows"];
	var len = settings['queueLength'];

	// Create Game canvas and Queue canvas
	$gameCanvas = $("<canvas>").attr('height', h).attr('width',  w).
	    attr("tabindex", '0').blur(methods.pause).focus(methods.unpause);

	$myQueueCanvas = $("<canvas>").attr('height', settings['queueHeight']).attr('width',  w).
	    attr("tabindex", '0').blur(methods.pause).focus(methods.unpause);

	// Create queue and fill it with zeros, denoting all empty
	myQueue = new Array(len);
	
	for (var i = 0; i < len; i++) {
	    myQueue[i] = 0;
	}

	$container.html("").append($gameCanvas).append($("<br />")).append($myQueueCanvas);

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
	case 49:
	case 50:
	case 51:
	case 52:
	case 53: // 49 - 57 map to keys 1 - 9
	case 54:
	case 55:
	case 56:
	case 57:
	    // Handle number keys with code - 49
	    addToQueue(code - 49);
	    break;
	case 48: // Number 0, pretending it's 10
	    // Handle number keys with 9
	    addToQueue(9);
	    break;
	}
	
	
	curDir = dir;
	return dir;
    }


    // Eventually this will take a value to add to the queue as well...
    function addToQueue(index) {
	if (myQueue[index] == 0) {
	    myQueue[index] =  {text:queueElementCounter++};
	    return true;
	}
	// Space was not empty, so nothing added
	return false;
    }



    /**
     * These functions (redraw(), drawBlank()) are all for painting the game
     **/

    function redraw(gameBoard) {
        var h = settings['canHeight'];
	var w = settings['canWidth'];
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
	
	drawQueue($myQueueCanvas);
    }

    // Should create the effect of the entire queue "sliding" to the left
    /* NOT FINISHED   function animateMyQueue($can) {
	$can.animateLayer("queueBackground", { props }, 250, "swing", function () {;});
	}*/

    function drawQueue($can) {
	var h = settings['queueHeight'];
	var w = settings['queueWidth'];
	var len = settings['queueLength'];

	// Draw the background pattern
	// queueBackgroundPattern must be created and stored previously
	$can.drawRect({ fillStyle: queueBackgroundPattern,
		    repeat: "repeat-x",
		    x: 0, y:0, width: w + (w/len), height: h });*/

	var elWidth = (w / len);


	for (var i = 0; i < len; i++) {
	    if (myQueue[i] != 0) {
		// Fill in the queue elements
		$can.drawText({
			fillStyle: "black",
			    font: "20pt Verdana, sans-serif",
			    x: (i * elWidth) + (elWidth / 2) - 3,
			    y: h/3,
			    text: myQueue[i].text,
			    fromCenter: false});

	    }

	    // Draw out indices.	    
	    $can.drawText({
		    fillStyle: "black",
			font: "8pt Verdana, sans-serif",
			x: (i * elWidth) + (elWidth / 2),
			y: h - (2*h /10 ),
			text: i + 1,
			fromCenter: false});
	    
	}
    }

    

    function drawEmpty($can, _x, _y, w) {
	$can.drawRect({ strokeStyle: "#CCCCFF",
		    x: _x, y: _y, 
		    width: settings['canWidth']/settings["cols"],
		    height: settings['canHeight']/settings["rows"],
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
		    x: settings['canWidth']/3,
		    y: settings['canHeight']/3,
		    text: "Paused! Click to continue!",
		    fromCenter: false,
		    rotate: 10 });
    }
    


    function unPauseGame() {
	if (gamePaused) {
	    startGame();
	    gamePaused = false;
	}

    }




    // END Private Functions
})( jQuery );

