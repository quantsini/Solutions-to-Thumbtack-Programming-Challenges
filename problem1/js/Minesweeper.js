MinesweeperGame = function() {
	// cell represents a node in a graph 
	var Cell = function () {
		// is this cell a bomb?
		this.isBomb = false;
		
		// if this cell was clicked on
		this.visible = false;
		
		// if this cell has been flagged
		this.flagged = false;
		
		// used by depth first search
		this.dfsVisited = false;
		
		// west, north, east, south, up, down contains references to other cells. up and down are used if minesweeper in 3 dimensions (not show the game in 3d) is activated
		this.neighbors = {'w': null, 'n': null, 'e': null, 's': null, 'u': null, 'd': null}; 
		
		// populate this as a "cache" so we don't have to compute number of bombs on the fly
		this.adjBombNumber = 0;
		
		// this function is called when a state is changed, signaling the UI to update its information
		this.updateUIState = function() {};
	};
	Cell.prototype = {
		registerUIState: function(callback) {
			this.updateUIState = callback;
			this.updateUIState();
		}
	};
	
	// MakeTable creates a table of size tableSize by tableSize, with numBombs number of random cells that are considered "bombs".
	// these are randomly chosen uniformly. 
	this.makeTable = function(sizex, sizey, numBombs, existingData) {
		var totalNumElements = sizex*sizey;
		var table = new Array(totalNumElements);
	
		// create the cells
		for (var lcv = 0; lcv < totalNumElements; lcv++) {
			table[lcv] = new Cell();
		}
		
		if (existingData !== null) {
			for (var lcv = 0; lcv < totalNumElements; lcv++) {
				var cell = table[lcv];
				var loadCell = existingData[lcv];
				cell.isBomb = loadCell.isBomb ? true : false;
				cell.visible = loadCell.visible ? true : false;
				cell.flagged = loadCell.flagged? true : false;
			}
		} else {
			// assign the first numBomb cells as being a bomb
			for (var lcv = 0; lcv < numBombs; lcv++) {
				table[lcv].isBomb = true;
			}
			
			// use Fisher-Yates shuffle algorithm - http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
			// to shuffle the table
			for (var lcv = totalNumElements - 1; lcv >= 0; lcv--) {
				var randNum = Math.floor(Math.random()*lcv);
				
				//swap
				var temp = table[lcv];
				table[lcv] = table[randNum];
				table[randNum] = temp
			}
		}
		// assign the neighbors for use for depth first search,
		for (var lcv = 0; lcv < totalNumElements; lcv++) {
			var cell = table[lcv];
			// west, north, east, south indexes
			var indexes = {'w': (lcv % sizex !== 0) ? lcv - 1 : -1, 'e': ((lcv+1) % sizex !== 0) ? lcv + 1 : -1, 'n': lcv - sizex, 's': lcv + sizex};
			var directions = ['e','n','w','s'];
			for (var lcv2 = 0; lcv2 < directions.length; lcv2++) {
				var direction = directions[lcv2];
				var index = indexes[direction];
				cell.neighbors[direction] = (index < 0 || index >= totalNumElements) ? null : table[index];
			}
		}
		
		//count the number of bombs adjacent to each cell
		for (var lcv = 0; lcv < totalNumElements; lcv++) {
			var cell = table[lcv];
			
			//count the number of adjecent bombs
			cell.adjBombNumber = 0;
			for (var lcv2 = 0; lcv2 < directions.length; lcv2++) {
				var direction = directions[lcv2];
				if (cell.neighbors[direction] !== null && cell.neighbors[direction].isBomb) {
					cell.adjBombNumber += 1;
				}
			}
			
			//check diagonals, which are the neighbors of north and south
			if (cell.neighbors['n'] !== null) {
				if (cell.neighbors['n'].neighbors['w'] !== null && cell.neighbors['n'].neighbors['w'].isBomb) {
					cell.adjBombNumber += 1;
				}
				if (cell.neighbors['n'].neighbors['e'] !== null && cell.neighbors['n'].neighbors['e'].isBomb) {
					cell.adjBombNumber += 1;
				}
			}
			if (cell.neighbors['s'] !== null) {
				if (cell.neighbors['s'].neighbors['w'] !== null && cell.neighbors['s'].neighbors['w'].isBomb) {
					cell.adjBombNumber += 1;
				}
				if (cell.neighbors['s'].neighbors['e'] !== null && cell.neighbors['s'].neighbors['e'].isBomb) {
					cell.adjBombNumber += 1;
				}
			}
		}
		
		return table;
	};
	
	// if user clicks on an empty (no adjecent bombs) square, traverse to reveal a partition of like-wise squares
	this.traverseAndReveal = function(startCell) {
		// clearing out the dfs flag
		for (var lcv = 0; lcv < this.table.length; lcv++) {
			this.table[lcv].dfsVisited = false;
		}
		var toVisit = [];
		
		// perform depth first search, ignoring all cells that are flagged as a bomb or flagged as a flagre
		// push the current cell onto the visiting stack...
		toVisit.push(startCell);
		
		// while we have some noes to visit...
		while (toVisit.length > 0) {
			// pop a cell off the stack
			var curCell = toVisit.pop();
			
			// only visit this node if it isn't visible, not flagged, and has no adjecent bombs
			if (curCell.visible === false && curCell.flagged === false && curCell.adjBombNumber === 0) {
				// mark this as visited, and visible
				curCell.dfsVisited = true;
				curCell.visible = true;
				
				// for each direction...
				var directions = ['e','n','w','s'];
				for (var lcv2 = 0; lcv2 < directions.length; lcv2++) {
					direction = directions[lcv2];
					// push each direction onto the stack to visit
					if (curCell.neighbors[direction] !== null) {
						toVisit.push(curCell.neighbors[direction]);
					}
				}
				
				//update the UI to reflect the changes to visibility
				curCell.updateUIState();
			}
		}
		
		// we only revealed all cells that have no adjecent bomb, so that means all neighbors have at least one bomb neighbor. reveal them
		var directions = ['e', 'n', 'w', 's'];
		for (var lcv = 0; lcv < this.table.length; lcv++) {
			var cell = this.table[lcv];
			
			// if we visited this node, make visible all it's surrounding nodes, since we know the neighbors have no bombs
			if (cell.dfsVisited === true) {
				// for each direction...
				for (var lcv2 = 0; lcv2 < 4; lcv2++) {
					var direction = directions[lcv2];
					
					// only mark it visible if it's not flagged
					if (cell.neighbors[direction] && cell.neighbors[direction].flagged === false) {
						cell.neighbors[direction].visible = true;
						cell.neighbors[direction].updateUIState();
					}
				}
			}
		}
	};
	
	this.table = null;
	this.endGameCallback = function () {}
	this.cheatMode = false;
	this.gameState = 'ongoing';
	this.dimensions = {x: 0, y: 0};
	
	return this;
}
MinesweeperGame.prototype = {
	// initialize the game
	init: function (sizex, sizey, numberBombs, loadData) {
		this.table = this.makeTable(sizex, sizey, numberBombs, loadData);
		this.dimensions = {x: sizex, y: sizey};
	},
	
	// called when you want to activate a cell on the board
	activateCell: function(x, y) {
		// while the game is still going
		if (this.gameState === 'ongoing') {
			var cell = this.table[x+y*this.dimensions.x];
			
			// don't do anything if this cell is already visible or flagged
			if (cell.visible === false && cell.flagged === false) {
				// if it's a bomb, lose, otherwise mark this cell as visible
				if (cell.isBomb) {
					this.triggerLose(this.table)
				} else {
					if (cell.visible === false) {
						if (cell.adjBombNumber === 0) {
							this.traverseAndReveal(cell);
						} else {
							cell.visible = true;
							cell.updateUIState();
						}
					}
				}
			}
		}
	},
	
	// called when you want to flag a cell on the board
	flagCell: function(x, y) {
		if (this.gameState === 'ongoing') {
			var cell = this.table[x+y*this.dimensions.x];
			
			// flag only cells that are hidden
			if (cell.visible === false) {
				cell.flagged = cell.flagged ? false : true;
				cell.updateUIState();
			}
		}
	},
	
	// called when we lose the game
	triggerLose: function(table) {
		this.gameState = 'lose';
		
		// reveal the board
		for (var lcv = 0; lcv < this.table.length; lcv++) {
			this.table[lcv].visible = true;
			this.table[lcv].updateUIState();
		}
		
		this.endGameCallback(this.gameState);
	},
	
	// called when we win the game
	triggerWin: function(table) {
		this.gameState = 'win';
		
		// reveal the board
		for (var lcv = 0; lcv < this.table.length; lcv++) {
			this.table[lcv].visible = true;
			this.table[lcv].updateUIState();
		}
		
		this.endGameCallback(this.gameState);
	},
	
	// check to see if we won the game
	validate: function() {
		if (this.gameState === 'ongoing') {
			// winning condition is for all cells on the board, if it is hidden, it is a bomb
			// therefore taking the negation (for losing) would be there exists a cell such that it is hidden, and is not a bomb
			// (p => q == ~p v q, negation is p ^ ~q)
			for (var lcv = 0; lcv < this.table.length; lcv++) {
				var cell = this.table[lcv];
				if (cell.visible === false && cell.isBomb === false) {
					this.triggerLose();
					return;
				}
			}
			
			// there does not exist any cell that is hidden and is not a bomb, so all hidden cells are bombs, we win!
			this.triggerWin();
		}
	},
	
	// register any UI updates whenever we change a cell state
	registerUIState: function (x, y, callback) {
		this.table[x+y*this.dimensions.x].registerUIState(callback);
	},
	
	// register any losing callbacks
	registerEndGame: function (callback) {
		this.endGameCallback = callback;
	},
	
	// activates cheat mode (shows the numbers)
	toggleCheatMode: function () {
		this.cheatMode = this.cheatMode ? false : true;
		for (var lcv = 0; lcv < this.table.length; lcv++) {
			this.table[lcv].updateUIState();
		}
	},
	
	saveGame: function () {
		var toJson = [];
		toJson.push(this.dimensions);
		toJson.push(this.cheatMode);
		game.table.reduce(function(prev, cur, index, arr) {
			var toPush = {
				isBomb: cur.isBomb ? true : false,
				visible: cur.visible ? true : false,
				flagged: cur.flagged ? true : false
			}
			prev.push(toPush);
			return prev;
		}, toJson);
		
		return toJson;
	}
};