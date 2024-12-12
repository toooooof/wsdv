var Log = {

	// actions possibles
	A: {
		choose_card : 0,
		remove_unrest : 1,
		build : 2,
		ls : 3,
		unrest : 4,
		dismantle : 5,
		move_unrest : 6,
		remove_mass_protest : 7,
		remove_ls : 8,
		stop_factory : 9,
		rundown : 10,
		repair : 11,
		end_of_decade_step: 12,
		nothing: 13,
		remove_socialists: 14,
		add_supplier_mp: 15,
		free: 16,
		buildwall: 17,
		removewall: 18,
		westernCurrency: 19,
		arrows: 20,
		removed_icon: 21,
		addSocialist: 22,
		stasi_disbandment: 23,
		guillaumaffair: 24,
		choose_prestige: 25,
		must_attack: 26,
		no_target: 27,
		reduce_ls_eod05: 28,
		reduce_ls_wb_eod05: 29,
		ls_low_eod06: 30,
		dismantle_required: 31,
		dismantle_for_wall: 32,
		rundown_needed: 33,
		dismantle_required_eod04: 34,
		police_cards_left: 35,
		socialists_gain_loss: 36,
		no_winner: 37,
		full_ls : 38,

	},

	log: function(game, side, action, param, timestamp) {
		if (timestamp == undefined) timestamp = new Date().getTime() - IO.decalage;

		this.history(game, side, action, param, timestamp);

		if (game.logs == undefined) game.logs = [];
		game.logs.push({
			side: side,
			action: action,
			param: param,
			timestamp: timestamp
		});

	},

	history: function(game, side, action, param, timestamp) {

		if (timestamp == undefined) timestamp = new Date().getTime();
		
		var strPlayer = "";

		var div = $('<div class="log">');
		if (side === R.WEST) {
			strPlayer = game.players[0].name;
			div.addClass('west');
		} else if (side === R.EAST) {
			strPlayer = game.players[1].name;
			div.addClass('east');
		}

		div.append('<div class="header"><span> ' + this.giveFormattedDate(timestamp) + ' </span></div>')
		div.append(this.giveFullText(strPlayer, action, param, side));
		$("#history").prepend(div);

	},

	giveFullText: function(player, action, param, side) {
		var res = $('<div>');
		if (action == this.A.choose_card) {
			res.append('<span>' + player + ' plays </span>');
			var img = giveCard(param[0]);
			img.addClass('history');
			res.append(img);

			if (param[2] === true) {
				res.append(' <span> from hand </span> ')
			}

			switch (param[1]) {
				case 1:
					res.append(' <span> for : </span><img src="img/removeUnrest.png" class="history_logo"/>');
					break;
				case 2:
					res.append(' <span> for : </span>');
					if (side == R.EAST) res.append('<img src="img/buildRed.png" class="history_logo"/>');
					else if (side == R.WEST) res.append('<img src="img/buildYellow.png" class="history_logo"/>');
					else res.append('<span>Build action</span>');
					break;
				case 3:
					res.append(' <span> for : <img src="img/lsCounter.png" class="history_logo"/>');
					break;
				case 4:
					res.append('<span> for the event</span>');
					break;
			}
		} else if (action == this.A.remove_unrest) {
			res.append(player + ' removes one unrest counter in ' + N.provinces[param[0] - 50]);
			if (param[1] != undefined && param[1] == true) {
				res.append(" with the police");
			}
		} else if (action == this.A.ls) {
			res.append(player + ' increases living standard in ' + N.provinces[param[0] - 50]);
		}  else if (action == this.A.full_ls) {
			if (param[1] === true) {
				res.append(player + ' increases living standard in ' + N.provinces[param[0] - 50] + ' and removed 1 unrest');
			} else {
				res.append(player + ' increases living standard in ' + N.provinces[param[0] - 50] + ' but there was no unrest to remove');
			}
			
		} else if (action == this.A.build) {
			if (param[0] == 0) {
				res.append(player + ' builds a factory in ' + N.factories[param[1]]);
			} else if (param[0] == 1) {
				res.append(player + ' builds a infrastructure in ' + N.provinces[R.provincesForRoad(param[1])[0]-50]);
			}
		} else if (action == this.A.unrest) {
			var force = "one";
			if (param.length > 1) force = param[1];
			var qui = player;
			if (param.length >= 3 && param[2] != undefined) {
				qui = param[2];
			}
			res.append(qui + ' places ' + force + ' unrest counter in ' + N.provinces[param[0] - 50]);
		} else if (action == this.A.remove_ls) {
			res.append(player + ' decreases living standard in ' + N.provinces[param[0] - 50]);
		} else if (action == this.A.dismantle) {
			if (param[0] == 0) {
				res.append(player + ' dismantles a factory in ' + N.factories[param[1]]);
			} else if (param[0] == 1) {
				res.append(player + ' dismantles an infrastructure in ' + N.provinces[R.provincesForRoad(param[1])[0]-50]);
			}
		} else if (action == this.A.stop_factory) {
			res.append(player + ' stops a factory in ' + N.factories[param[0]]);
		} else if (action == this.A.remove_mass_protest) {
			res.append(player + ' removes a mass protest marker in ' + N.provinces[param[0] - 50]);
		} else if (action == this.A.move_unrest) {
			res.append(player + ' moves one unrest counter from ' + N.provinces[param[0] - 50] +' to ' + N.provinces[param[1] - 50]);
		} else if (action == this.A.rundown) {
			res.append(player + ' runs a factory down in ' + N.factories[param[0]]);
		} else if (action == this.A.repair) {
			res.append(player + ' repairs a factory in ' + N.factories[param[0]]);
		} else if (action == this.A.end_of_decade_step) {
			res.append('<img src="img/decade' + param[0] + '.png" class="eod_icon" />')
			res.append('End of Decade - Step ' + param[0] + ' is completed');
		} else if (action == this.A.remove_socialists) {
			res.append(player + ' removes a socialist counter in ' + N.provinces[param[0] - 50]);
		}  else if (action == this.A.add_supplier_mp) {
			res.append(player + ' adds a mass protest marker in ' + N.provinces[param[0] - 50] + ', coming from West Berlin (as a supplier)');
		} else if (action == this.A.nothing) {
			res.append(player + ' did nothing');
		} else if (action == this.A.free) {
			res.append(param);
		} else if (action == this.A.buildwall) {
			res.append(player + ' builds the Berlin Wall');
		} else if (action == this.A.removewall) {
			res.append(player + ' tears the Berlin Wall down');
		} else if (action == this.A.westernCurrency) {
			res.append('Western Currency phase details : ');
			var table = $('<table></table>');
			table.append('<tr><td>WC line</td><td>' + param[1] + '</td></tr>');
			table.append('<tr><td># of LS</td><td>' + param[2] + '</td></tr>');
			table.append('<tr><td>Worst West Export Factory</td><td>' + param[3] + '</td></tr>');
			table.append('<tr><td># East Exp. Fac. of this strength (or more)</td><td>' + param[4] + '</td></tr>');
			table.append('<tr><td>Total</td><td>' + param[0] + '</td></tr>');
			res.append(table);

			if (param[0] >= 0) {
				res.append('No rundown required, enough Western Currency for the East');
			} else {
				res.append('East lacks of ' + Math.abs(param[0]) + ' Western Currency point(s)');
			}
		} else if (action == this.A.arrows) {
			for (var i = 0 ; i < param.length ; i++) {
				if (param[i] != 0) res.append(giveArrowLine(i, param[i]));
			}
		} else if (action == this.A.removed_icon) {
			res.append(player + " removed the following icon : ");
			if (param.length == 1) {
				if (!isNaN(param[0])) {
					res.append(giveCompleteIcon(param[0], undefined, undefined, undefined, 'informative'));
				} else {
					res.append(giveCompleteIcon(param[0].symbol, undefined, undefined, param[0].player, 'informative'));
				}
			} else {
				res.append(giveArrowLine(param[0], param[1]));
			}
		} else if (action == this.A.addSocialist) {
			if (param[1] != undefined) {
				res.append(player + ' calls ' + param[1] + ' socialist(s) in ' + N.provinces[param[0] - 50]);
			} else {
				res.append(player + ' calls a socialist in ' + N.provinces[param[0] - 50]);
			}
		} else if (action == this.A.stasi_disbandment) {
			res.append('East disbands the stasi');
		} else if (action == this.A.guillaumaffair) {
			switch(param[0]) {
				case 0:
					if (param[1] == 0) res.append('East search the deck during Guillaume affair');
					else res.append('East search West\'s hand during Guillaume affair');
					break;
				case 1:
					if (param[1] == 0) res.append('East switch one card from the deck');
					else res.append('East switch one card from West\'s hand');
					break;
				case 2:
					res.append('East removes a card from the deck');
					break;
				case 3:
					res.append('East does nothing during Guillaume affair');
					break;
			}
		} else if (action == this.A.choose_prestige) {
			res.append(player + ' chooses a prestige bonus');
		} else if (action == this.A.must_attack) {
			res.append(N.provinces[param[0]-50] + ' has no choice but to attack ' + N.provinces[param[1]-50] + ' and put ' + param[2] + ' unrest');
		} else if (action == this.A.no_target) {
			res.append(N.provinces[param[0]-50] + ' has no valid target');
		} else if (action == this.A.reduce_ls_eod05) {
			res.append(N.provinces[param[0]-50] + ' must reduce its living standard, because its export factory is not strong enough');
		} else if (action == this.A.reduce_ls_wb_eod05) {
			res.append('West Berlin must reduce its living standard, because at least one of its suppliers\' export factory is not strong enough');
		} else if (action == this.A.ls_low_eod06) {
			res.append(N.provinces[param[0]-50] + '  takes ' + param[1] + ' unrest counter(s) because its living standard is too low');
		} else if (action == this.A.dismantle_required) {
			if (param[0] == 0) {
				res.append('No dismantle required for the first End of Decade phase');
			} else {
				res.append(param[0] + ' dismantle(s) required for the first End of Decade phase');
			}
		} else if (action == this.A.dismantle_for_wall) {
			res.append('The wall is built, East must dismantle');
		} else if (action == this.A.rundown_needed) {
			if (param[0] <= 0 && param.length < 2) {
				res.append('East has enough Western Currency, no rundown is needed');
			} else if (param.length == 1) {
				res.append('East has to face ' + param[0] + ' rundown, because s/he lacks of Western Currency');
			} else {
				if (param[0] > 0) res.append('All the East factories ran down. East must now face ' + param[0] + ' dismantle(s)');
				else if (param[0] == 0) res.append('All the East factories ran down. There is no more dismantle to face');
			}
		} else if (action == this.A.dismantle_required_eod04) {
			if (param[0] == 0) {
				res.append('East does not control any police card');
			} else {
				res.append('East must face ' + param[0] + ' dismantle(s) for her/his police cards');
			}
		} else if (action == this.A.police_cards_left) {
			res.append('East has still ' + param[0] + ' police cards to use');
		} else if (action == this.A.socialists_gain_loss) {
			if (param[0] > 0) {
				res.append('East gains ' + param[0] + ' socialists');
			} else {
				res.append('East loses ' + -param[0] + ' socialists');
			}
		} else if (action == this.A.no_winner) {
			res.append('There is no winner at this point');
		}

		return res;
	},

	giveFormattedDate: function(timestamp) {

		var d = new Date(timestamp);
		var res = d.getFullYear() + '/';
		if (d.getMonth() < 9) res += '0' + (d.getMonth() + 1) + '/';
		else res += (d.getMonth() + 1 ) + '/';
		if (d.getDate() < 10) res += '0' + d.getDate() + ' ';
		else res += d.getDate() + ' ';
		if (d.getHours() < 10) res += '0' + d.getHours() + ':';
		else res += d.getHours() + ':';
		if (d.getMinutes() < 10) res += '0' + d.getMinutes() + ':';
		else res += d.getMinutes() + ':';
		if (d.getSeconds() < 10) res += '0' + d.getSeconds();
		else res += d.getSeconds();

		return res;

	},

	refreshHistory: function(game, last) {
		if (last == undefined) last = 15;
		if (game.workflow.phase == R.END_OF_DECADE && last == 15) last = 25;
		if (game.logs != undefined) {
			var t = _.sortBy(game.logs, 'timestamp');
			$("#history").empty();
			if (last > -1 && t.length > last) {
				t = t.slice(t.length-last, t.length);
			}
			_.each(t, function(item) {
				this.history(game, item.side, item.action, item.param, item.timestamp);
			}, this);

			this.computeAndDisplayTime(game);
		}
	},

    computeAndDisplayTime: function(game) {
       var gameLogs = _.sortBy(game.logs, 'timestamp');
       var div = $('<div class="watch log" />')

       var timeSpent = [0,0];

       var startingDateModifier = new Date(global.creationdate).getTimezoneOffset() * 60 * 1000;
       var prevTime = global.creationdate + startingDateModifier;
       var prevSide = null;

       for (var i = 0 ; i < game.logs.length ; i++) {
           var l = game.logs[i];
           if (prevSide != l.side && (l.side == 1 || l.side == 2)) {
               timeSpent[l.side - 1] += l.timestamp - prevTime;
               prevSide = l.side;
               prevTime = l.timestamp;
           }
       }

       div.append('<span>Total time: </span> ');
       div.append('<span class="west">' + this.formatDuration(timeSpent[0]) + '</span> <span> | </span> ');
       div.append('<span class="east">' + this.formatDuration(timeSpent[1]) + '</span>');

       $("#history").append(div);
    },

    formatDuration: function(duration) {
       var finalStr = "";
       var t = Math.round(duration / 1000);

       if (t >= 1) {
           finalStr = (t%60) + "s";
           t = Math.floor(t/60)
       }

       if (t >= 1) {
           finalStr = (t%60) + "m" + finalStr;
           t = Math.floor(t/60)
       }

       if (t >= 1) {
           finalStr = (t%24) + "h" + finalStr;
           t = Math.floor(t/24)
       }

       if (t >= 1) {
           finalStr = t + "d " + finalStr;
       }
       return finalStr;
    }
}