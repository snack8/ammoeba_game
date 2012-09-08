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

    var gameState;
    var timeoutID;
    var curDir = "down";
    var gamePaused = false;
    var myQueue;    
    var queueElementCounter = 0;
    var timestep;
    var myActions = [];
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
        if (serverInUse == "local") {
	    serverInit();
	    var s = serverUpdate(0, []);
	    myQueue = s.userQueue;
	    gameState = s.state;
	    timestep = s.timestep;
	    redraw(s.state);
	}
    }
    


    function keyHandler(e) {
	var dir = curDir;
	var code = e ? e.keyCode : -1;
	switch(code) {
	case 37: // Left Arrow
	    dir = "west";
	    addAction(1, dir);
	    break;
	case 38: // Up Arrow
	    dir = "north";
	    addAction(1, dir);
	    break;
	case 39: // Right Arrow
	    dir = "east";
	    addAction(1, dir);
	    break;
	case 40: // Down Arrow
	    dir = "south";
	    addAction(1, dir);
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
	    addAction(code - 49);
	    break;
	case 48: // Number 0, pretending it's 10
	    // Handle number keys with 9
	    addAction(9);
	    break;
	}
	
	
	curDir = dir;
	return dir;
    }


    // Only adds tokenName at index if queue[index] is empty
    function addAction(index, tokenName) {
	var i = 0;
	for (i = 0; myActions[i] && myActions[i].timestep < index; i++) {}

	if (!myActions[i] || myActions[i].timestep != timestep + index) {
	    myActions.push( {timestep: timestep + index,
			token: tokenName} );
	    return true;
	} else {
	    // Space was not empty, so adding in the back, one timestep further
	    addAction(index+1, tokenName);
	}

	return false;
    }



    /**
     * These functions (redraw(), drawBlank()) are all for painting the game
     **/

    function redraw(gameState) {
        var h = settings['canHeight'];
	var w = settings['canWidth'];
	var c = settings["cols"];
	var r = settings["rows"];

	$gameCanvas.clearCanvas();

	for(var i = 1; i < r - 1; i++) {
	    for(var j = 1; j < c - 1; j++) {
		var x = (w/c) * j;
		var y = (h/r) * i;

		if (gameState.user.y == i &&
		    gameState.user.x == j) {

		    $gameCanvas.drawText({
			    strokeStyle: "#1f1",
				x: x,
				y: y,
				text: "U",
				fromCenter: false,
				rotate: 10 });
		} else {
		    
		    $gameCanvas.drawText({
			    fillStyle: "#bfb",
				x: x,
				y: y,
				text: "_",
				fromCenter: false,
				rotate: 10 });
		}
		    
	    }
	}
	
	drawQueue($myQueueCanvas);
    }

    // Should create the effect of the entire queue "sliding" to the left
    /* NOT FINISHED   
       function animateMyQueue($can) {
	$can.animateLayer("queueBackground", { props }, 250, "swing", function () {;});
	}*/

    function drawQueue($can) {
	var h = settings['queueHeight'];
	var w = settings['queueWidth'];
	var len = settings['queueLength'];

	// Draw the background pattern
	/* queueBackgroundPattern must be created and stored previously
	$can.drawRect({ fillStyle: queueBackgroundPattern,
		    repeat: "repeat-x",
		    x: 0, y:0, width: w + (w/len), height: h });*/

	var elWidth = (w / len);
	$can.clearCanvas();


	for (var i = 0; i < len; i++) {
	    if (myQueue[i]) {
		// Fill in the queue elements
		$can.drawText({
			fillStyle: "black",
			    font: "20pt Verdana, sans-serif",
			    x: (i * elWidth) + (elWidth / 2) - 3,
			    y: h/3,
			    text: myQueue[i].token.token,
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

    /**
     * advance() uses serverUpdate() if using the local server
     * serverUpdate should pass the current timestep and an array of
     * { timestep: integer, token: tokenName }
     **/
    function advance() {
	var update = serverUpdate(timestep, myActions);
	timestep = update.timestep;
	myQueue =  update.userQueue;
	myActions = [];

	redraw(update.state);
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

