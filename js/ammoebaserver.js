/**
 * Starting with something simple: 
 *   Simply return an environment changed each call, so
 *   we can see the "server" churning
 *
 **/


global_server_state = 1;

global_server_settings = { cols : 20,
		 rows : 20 };


function serverInit() {

    global_server_state = createGrid();

    return true;
}

function createGrid() {
    var r = global_server_settings.rows;
    var c = global_server_settings.cols;
    
    var grid = new Array(c);

    for (var i = 0; i < r; i++) {
	grid[i] = new Array(c);
	
	for (var j = 0; j < c; j++) {
	    grid[i][j] = 0;
	}
    }

    return grid;
}

function serverUpdate() {
    var r = global_server_settings.rows;
    var c = global_server_settings.cols;
 
    var nextState = createGrid();

    for (var i = 0; i < r; i++) {
	for (var j = 0; j < c; j++) {
	    global_server_state[i][j] += 1;
	    nextState[i][j] = global_server_state[i][j];
	}
    }

    return nextState;
}
