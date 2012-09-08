/**
 * Starting with something simple: 
 *   Simply return an environment changed each call, so
 *   we can see the "server" churning
 *
 **/


globals;


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
    var c = global.game.cols;
    // Until end of this function, globals.server.state is old news. So make sure to set it!
    var nextState = copyGrid(globals.server.state);
    globals.server.pastStates.push(globals.server.state);
    
    
    // Advance all the queues, hoping that advanceQueue Modifies nextState
    for (var q in globals.game.queues) {
	advanceQueue(q, nextState);
    }

    globals.server.timestep++;

    // Update global server state and return this state back to the caller (game client)
    globals.server.state = nextState;
    return nextState;
}

/** 
 * !!!! Modifies state!!!!!
 **/ 
function advanceQueue(queue, state) {

    


}

function addToQueue


/**
 * Sets / Resets server completely
 *
 **/
function serverInit() {
    
    globals = 
	{
	    server : { state : createGrid(),
		       timestep: 0,
		       pastStates: new Array() },
	    game   : { cols : 20,
		       rows : 20,
		       queues : { user   : new Array(),
				  system : new Array(),
				  effects: new Array() }}
	    };
    
    return true;
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

