// thumbtack program challenge #1: make minesweeper.
// by: Henri Bai

// called when page is loaded
$(function () {
	var createGame = function(sizex, sizey, numBombs, container, loadData) {
		var Game = new MinesweeperGame();
		Game.init(sizex, sizey, numBombs, loadData);
		
		for (var y = 0; y < sizey; y++) {
			for (var x = 0; x < sizex; x++) {
				container.append(
					(function(x, y) {
						var size = 25; // 50 px
						var divo = $("<div></div>");
						divo.css("position","absolute");
						divo.css("width",size+"px");
						divo.css("height",size+"px");
						divo.css("left",100+(size+1)*x+"px");
						divo.css("top",250+(size+1)*y+"px");
						divo.css('background-color','gray');
						divo.css('border','1px solid black');
						divo.bind("contextmenu", function () {
							return false;
						});
						
						Game.registerUIState(x, y, function() {
							divo.text("");
							if (this.visible === true) {
								if (this.isBomb === true) {
									divo.css('background-color','orange');
									divo.text("B");
								} else if (this.isBomb === false) {
									divo.css('background-color','white');
									if (this.adjBombNumber !== 0) {
										divo.text(this.adjBombNumber);
									}
								}
							} else if (this.visible === false) {
								divo.css('background-color','gray');
							}
							
							if (this.flagged === true) {
								divo.css('background-color','yellow');
							}
							
							if (Game.cheatMode === true) {
								if (this.isBomb === true) {
									divo.text("B");
								} else {
									if (this.adjBombNumber !== 0) {
										divo.text(this.adjBombNumber);
									}
								}
							}
						});
						
						divo.bind('mousedown', function(e) {
							if (e.which === 1) {
								Game.activateCell(x, y);
							} else if (e.which === 3) {
								Game.flagCell(x, y);
							}
							return false;
						});
						return divo;
					})(x, y));
			}
		}
		
		Game.registerEndGame(function(state) {
			if (state === 'win') {
				$("#status").text("You Won!");
			} else if (state === 'lose') {
				$("#status").text("You Lost :(");
			}
			$("#validate").attr("disabled", "true");
			$("#cheatMode").attr("disabled", "true");
			$("#save").attr("disabled", "true");
		});
		
		return Game;
	}
	
	game = createGame(8, 8, 10, $("#gameContainer"), null);
	$("#newGame").bind("mousedown", function(e) {
		var x = parseInt($("#x").val());
		var y = parseInt($("#y").val());
		var numB = parseInt($("#numBombs").val());
		if (isNaN(x) || x <= 0) {
			alert("Size should be natural numbers!");
			return;
		}
		if (isNaN(y) || y <= 0) {
			alert("Size should be natural numbers!");
			return;
		}
		if (isNaN(numB) || numB <= 0) {
			alert("Number of bombs should be natural numbers!");
			return;	
		}
		if (x*y < numB) {
			alert("Number of bombs should not exceed board size");
			return;
		}
		
		$("#gameContainer").empty();
		$("#validate").removeAttr("disabled");
		$("#cheatMode").removeAttr("disabled");
		$("#save").removeAttr("disabled");
		$("#status").text("");
		game = createGame(x, y, numB, $("#gameContainer"), null);
	});
	
	$("#validate").bind("mousedown", function(e) {
		game.validate();
	});
	$("#cheatMode").bind("mousedown", function(e) {
		game.toggleCheatMode();
	});
	
	$("#save").bind("mousedown", function(e) {
		var saveData = game.saveGame();
		$("#saveString").val(JSON.stringify(saveData));
	});
	
	$("#load").bind("mousedown", function(e) {
		// probably not the most secure way, but easiest way.
		var jsonString = $("#loadString").val();
		try {
			var loadData = JSON.parse(jsonString);
		} catch(err) {
			$("#status").text("Error loading game");
			return;
		}
		var dimensions = loadData[0];
		var existingCells = loadData.slice(2);
		
		$("#gameContainer").empty();
		$("#validate").removeAttr("disabled");
		$("#cheatMode").removeAttr("disabled");
		$("#save").removeAttr("disabled");
		$("#status").text("");
		game = createGame(dimensions.x, dimensions.y, 0, $("#gameContainer"), existingCells);
	});
});