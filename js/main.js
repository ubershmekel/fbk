
$(function() {
	var game = {};
	game.playerKeys = [{}, {}];
	game.currentPlayer = 0;
	game.taken = 't';
	game.playerNames = {
		0: 'Player Left',
		1: 'Player Right'
	};
	game.playerColors = {
		0: '#00f',
		1: '#f00'
	};
	
	game.pidToStr = function(pid) {
		return "p" + pid;
	}
	
	game.otherPlayer = function() {
		return (game.currentPlayer + 1) % 2;
	}
	
	game.removeKey = function(pid, key) {
		delete game.playerKeys[pid][key];
		var elemName = game.pidToStr(pid) + 'key' + key;
		$('#' + elemName).remove();
	}

	game.addKey = function(pid, key) {
		game.playerKeys[pid][key] = game.taken;
		
		var elemName = game.pidToStr(pid) + 'key' + key;
		var elem = $('<div/>', {
			text: key,
			id: elemName
			});
		
		var holderId = '#' + game.pidToStr(pid) + 'keys';
		console.log(holderId);
		console.log(elemName);
		$(holderId).append(elem);
	}

	game.updateViz = function() {
		$('#currentPlayer').text(game.playerNames[game.currentPlayer]).css('color', game.playerColors[game.currentPlayer]);
		
	}
	
	game.nextTurn = function() {
		game.currentPlayer = game.otherPlayer();
		game.updateViz();
		
		game.queueTurn();
	}
	
	game.queueTurn = function() {
	   setTimeout(game.nextTurn, 2000);
	}
	
	
	
   $(window).keypress(function(e) {
		var key = e.which;
		console.log(key);
		if(game.playerKeys[game.currentPlayer][key] == game.taken) {
			// TODO: play wasted key sound
			return;
		}
		if(game.playerKeys[game.otherPlayer()][key] == game.taken) {
			// TODO: play conquer key sound
			game.removeKey(game.otherPlayer(), key);
		}
		
		game.addKey(game.currentPlayer, key);
   });
   
   game.updateViz();
   game.queueTurn();
});