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
    var nextDir = 'down',
	curDir  = 'down',
	curY    = 5,
	curX    = 5,
	directions = { 'down'  : [0, 1],
		       'left'  : [-1, 0],
		       'up'    : [0, -1],
		       'right' : [1, 0] };
    var settings =  { 
	    'width'      : 50,
	    'height'     : 20,
	    'emptyRep'   : '_',
	    'snakeRep'   : 's',
	    'appleRep'   : '@',
	    'delay'      : 600
	};
	
    // Public methods
    var methods = {
	init : function (options) {
	    
	    var $this = $(this),
	    data  = $this.data('snakeGame'),
	    
	    // Overwrite default settings with passed options
	    settings = $.extend(settings, options);
	    
	    // If plugin is not yet initialized, build game and bind keyhandler
	    if ( ! data ) {
		
		// Build game inside container
		buildGame($this);
		
		// FIXME: Must apply keyHandler somewhere here
	    } else {
		
		// If plugin unitialized, do nothing
		return $this;
	    }
	    return $this; // Maintain chainability
	},
	start : function () {
	    startGame();
	},
	pause : function () {
	    
	},
	reset : function () {
	    
	    
	}
    };
    
    // Creates plugin forealz
    $.fn.snakeGame = function( method ) {

	// Method calling logic.
	if ( methods[method] ) {
	    return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if (typeof method === 'object' || ! method ) {
	    return methods.init.apply(this, arguments );
	} else {
	    $.error( 'Method ' + method + ' does not exist on jQuery.snakeGame' );
	}
    };

    // Private functions follow
    function buildGame(container) {
	var wrap = $("<div>"),
	    h = settings["height"],
	    w = settings["width"];
	
	// Build the field
	for(var i = 0; i < h; i++) {
	    for(var j = 0; j < w; j++) {
		wrap.append( $("<span>").attr("x", j).attr("y", i).html(settings["emptyRep"]) );
	    }
	    wrap.append( $("<br />") );
	}
	
	// Add field to container
	container.append(wrap.contents());
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
	
	nextDir = dir;
    }

    function moveHead() {
	var next = directions[nextDir];

	curX += next[0];
	curY += next[1];
	change(curX, curY, settings['snakeRep']);
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
	runner(settings['delay']);
    }
    
    function change(x, y, val) {
	var el = $("span[x='"+x+"']").filter("[y='"+y+"']");
	var prev = el.html();
	el.html(val);
	return prev;
    }
    
    // END Private Functions
})( jQuery );


// ONREADY FUNC
$(function (){

	$("#gameContainer").snakeGame( {} ).snakeGame('start');

	//  $("#form").keydown(keyHandler).focus();

});