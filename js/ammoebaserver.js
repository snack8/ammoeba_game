/**
 * Starting with something simple: 
 *   Simply return an environment changed each call, so
 *   we can see the "server" churning
 *
 **/


; globals = null;


/**
 * Main loop!
 * Resolves all game logic
 * FOR NOW: 1 time step resolved every call.
 * FUTURE : # of time steps resolved at call, 1 per globals.game.delay milliseconds, since last-update call
 * 
 * Should:
 *   - TAKES "last updated" time-step & any changes to the user queue
 *   - Advance each queue
 *   - Advance timestep
 *   - RETURNS current user queue & current time-step & current game-state
 **/
function serverUpdate(clientTime, clientActions) {
    var r = globals.game.rows;
    var c = globals.game.cols;
    // Until end of this function, globals.server.state is old news. So make sure to set it!
    var nextState = globals.server.state;
    // I duno about this:   globals.server.pastStates.push(globals.server.state);

    // Attempt to add all client actions to user queue
    while (clientActions.length > 0) {
	addToQueue(globals.game.queues.user, clientActions.shift());
    }
    
    // Advance all the queues, hoping that advanceQueue Modifies nextState
    for (var q in globals.game.queues) {
	advanceQueue(globals.game.queues[q], nextState);
    }



    globals.server.timestep++;

    // Update global server state and return this state back to the caller (game client)
    globals.server.state = nextState;
    return { timestep : globals.server.timestep,
	    state     : nextState,
	    userQueue : globals.game.queues.user};
}

/** 
 * !!!! Modifies state!!!!!
 **/ 
function advanceQueue(queue, state) {
    var peek = queue[0];
    if (peek) {
	if (peek.timestep < globals.server.timestep) {
	    // an element in a queue slipped past its due date, might not be that important
	    alert("Error 569! You should really think about getting a better logger!");
	} else if (peek.timestep == globals.server.timestep) {
	    // It's time! unqueue and complete the action.
	    queue.shift();
	    
	    simpleMove(peek.token.dir, state);
	    
	} else {
	    // Queue's first element is not up yet, so chill and don't unqueue
	}
	
    } else {
	// Queue is empty
    }


}

/**
 * Modifies state!
 **/
function simpleMove(dir, state) {
    var next_x = state.user.x + globals.directions[dir].x;
    var next_y = state.user.y + globals.directions[dir].y;
    
    if (next_x >= 0 && next_x < globals.game.rows && 
	next_y >= 0 && next_x < globals.game.cols) {
	
	state.user.x = next_x;
	state.user.y = next_y;
    } else {
	// At boundaries, don't move
    }
}

// This function should accept incoming actions
/**
 *  Takes a queue, as well as iincoming actions in the form of:
 *     queue, { timestep: integer,
 *               token   : token_name_string }
 *  Adds to the queue if no current action at timestep, in fhte ofmr of:
 *     { timestep: integer,
 *       token   : token }
 **/
function addToQueue(queue, action){
    var t = action.timestep;
    var token = ALL_GAME_TOKENS[action.token];
    var i;

    for (i = 0; queue[i] && queue[i].timestep < t; i++) {}
    
    if ( !queue[i] || queue[i].timestep != t) {
	queue.splice(i,0, {timestep: t, token : token});
    } else {
	// Do nothing, already a token at this timestep
    }
	

}


/**
 * Sets / Resets server completely
 *
 **/
function serverInit() {
    
    globals = 
	{
	    server : { state : { user : { x: 5, 
					  y: 5} },
		       timestep: 0,
		       pastStates: new Array() },
	    game   : { cols : 20,
		       rows : 20,
		       queues : { user   : new Array(),
				  system : new Array(),
				  effects: new Array() }},
	    directions : { 'south'  : {x:0,  y:1},
			   'west'   : {x:-1, y:0},
			   'north'  : {x:0, y:-1},
			   'east'   : {x:1,  y:0} }
	    
	    };
    
    return { timestep : globals.server.timestep,
	    state     : globals.server.state,
	    userQueue : globals.game.queues.user};
}

function createGrid() {
    var r = globals.game.rows;
    var c = globals.game.cols;
    var grid = new Array(c);
    for (var i = 0; i < r; i++) {
	grid[i] = new Array(c);
	for (var j = 0; j < c; j++) {
	    grid[i][j] = 0;
	}
    }
    return grid;
}

function copyGrid(g) {
    var r = globals.game.rows;
    var c = globals.game.cols;
    var n = new Array(r);
    for (var i = 0; i < r; i++) {
	n[i] = g[i].slice(0);
    }
    return n;
}

