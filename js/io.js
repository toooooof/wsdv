var FIREBASE = true;

var IO = {

	url: '../Json',
	decalage: 0,

	init: function(id) {
		if (id != undefined && this.fb == undefined && FIREBASE === true) {
			this.id = id;
			this.fb = new Firebase('https://wsdv.firebaseio.com/' + id);
			this.chat = new Firebase('https://wsdv.firebaseio.com/chat' + id);
		}

		return this;
	},

	loadGameData: function(callback) {
		$.ajax({
			url: this.url,
			type: 'POST',
			data: {
				id: global.gameId,
				action: 'load'
			},
			success: callback
		});

	},

	saveGameData: function(game, creation) {
		var proceed = true;

		if (this.saveCall == undefined) this.saveCall = [];
		this.saveCall.push(new Date().getTime());
		while (this.saveCall.length > 20) {
			this.saveCall.shift();
		}
		if (this.saveCall.length == 20 && (this.saveCall[19]-this.saveCall[0] < 20000)) {
			proceed = false;
		}

		if (proceed === true) {

			var decade = game.workflow.decade;
			var nextPlayer = game.players[game.workflow.currentPlayer - 1].name;

			if (game.workflow.phase == R.CHANGE_HAND) {
				nextPlayer = '';
				if (game.players[0].ok == undefined || game.players[0].ok !== true) {
					nextPlayer += game.players[0].name;
				}
				if (game.players[1].ok == undefined || game.players[1].ok !== true) {
					if (nextPlayer != '') nextPlayer += ',';
					nextPlayer += game.players[1].name;
				}
			}

			var phase = R.givePhaseName(game.workflow.phase);

			var callData = {
				id: global.gameId,
				action: creation === true ? 'create' : 'save',
				data: game.export(),
				decade: decade,
				nextPlayer: nextPlayer,
				phase: phase
			};

			if (G.win != undefined) {
				callData.status = 'FINISHED';
	        	callData.nextPlayer = '',
				callData.saint = R.giveWinningConditionString(G.win),
				callData.winner = G.players[R.giveWinningSide(G.win) - 1].name
			}

			$.ajax({
				url: this.url,
				type: 'POST',
				data: callData,
				success: function(d,s,x) {
					IO.blur();
				},
				error: function() {
				    alert('Something went wrong. Please reload the page. If the problem is still here, please contact the admin')
				}
			});
		}
	},

	forkGame: function(game) {
		var g = new Game();
		g.load(JSON.parse(game.export()));

		g.players[0].name = 'tof';
		g.players[1].name = 'Deiphobe';

		var nextPlayer = 'tof';
		if (game.workflow.currentPlayer == R.EAST)  nextPlayer = 'Deiphobe';

		$.ajax({
			url: this.url,
			type: 'POST',
			data: {
				id: global.gameId,
				action: 'fork',
				next: nextPlayer,
				data: g.export().replace(/\\\\\\/g,'\\')
			},
			success: function(d,s,x) {
				alert('Game successfully saved, you can do whatever you want with this one');
			}
		});
	},

	bugEntry: function(game, desc) {

		if (global != undefined && global.name != undefined) {
			$.ajax({
				url: this.url,
				type: 'POST',
				data: {
					id: global.gameId,
					action: 'bugentry',
					user: global.name,
					description: desc

				},
				success: function (d, s, x) {
					IO.forkGame(game)
				}
			});
		}
	},

	victory: function(game, victory, player) {

		if (victory != undefined && player != undefined) {
			$.ajax({
				url: this.url,
				type: 'POST',
				data: {
					id: global.gameId,
					action: 'victory',
					player: player,
					victory: victory

				}
			});
		}

	},

	postMessage: function(message, player) {
		$.ajax({
			url: this.url,
			type: 'POST',
			data: {
				id: global.gameId,
				action: 'chatmessage',
				type: 'add',
				player: player,
				message: htmlEscape(message)
			},
			success: function() {
				var d = new Date().getTime();
				var m = {m:htmlEscape(message),p:player,t:d};
				if (IO.chat != undefined) {
					IO.chat.child('message').set(m);
				}
			}
		});
	},

	getMessages: function(view) {
		$.ajax({
			url: this.url,
			type: 'POST',
			data: {
				id: global.gameId,
				action: 'chatmessage',
				type: 'get'
			},
			success: function(d,s,x) {
				view.refreshChat(JSON.parse(d).chat);
			}
		});
	},

	focus: function(callback) {
		if (this.fb != undefined) {
			this.fb.child('focus').on('value', callback);
		}
	},

	focusChat: function(callback) {
		if (this.chat != undefined) {
			this.chat.child('message').on('value', callback);
		}
	},

	blur: function() {
		if (this.fb != undefined) {
			this.fb.child('focus').set(new Date().getTime());
		}
	}
}

function htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

// I needed the opposite function today, so adding here too:
function htmlUnescape(value){
	return String(value)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}