/*

	- ordre des différents decks
	- card row
	- cartes défaussées pour cette décade
	- main des joueurs
	- map (usines, routes, unrest, LS, mass protest, socialists, 3 pistes)
	- turn order / workflow
*/


function Game() {}

Game.prototype.start = function(east, west) {
	if (east == undefined) east = "East";
	if (west == undefined) west = "West";

	this.currentDeck = R.giveInitDeckDecade(1);
	this.cardRow = this.currentDeck.splice(0,7);
	this.eastCard = 81;

	var p = [];
	p.push({name:west,hand:this.currentDeck.splice(0,2)});
	p.push({name:east,hand:this.currentDeck.splice(0,2)});
	this.players = p;

	this.workflow = {turn:1, phase:R.ACTION_PHASE, currentPlayer: R.WEST, decade: 1};

    var only2 = [R.NORDRHEIN_WESTFALEN, R.RHEINLAND_PFALZ, R.BADEN_WURTTEMBERG];
	for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
		if (only2.indexOf(i) == -1) {
		    this.unrest(i, 3, true);
		} else {
			this.unrest(i, 2, true);
		    if (global.creationdate < NEWRULES_TS) this.unrest(i, 1);
		}
	}

	this.socialistsBox(1, true);
	if (global.creationdate < NEWRULES_TS) this.socialistsBox(1);
	this.buildFactory(R.HAMBURG);
	this.buildFactory(R.DORTMUND);
	this.buildFactory(R.BITTERFELD);
	this.buildFactory(R.BERLIN_EAST);

	this.lines = [0,0,0];
};

Game.prototype.export = function() {
	var obj = {};

	if (this.currentDeck != undefined) obj.a = this.currentDeck.concat([]);
	if (this.cardRow != undefined) obj.b = this.cardRow.concat([]);
	if (this.eastCard != undefined) obj.c = this.eastCard;
	if (this.players != undefined) {
		var p = [];
		_.each(this.players, function(player) {
			var o = {};
			o.n = player.name;
			o.h = player.hand.concat([]);
			if (player.police != undefined) o.p = player.police.concat([]);
			if (player.hamburg != undefined) o.v = player.hamburg;
			if (player.toBerlin != undefined) o.b = player.toBerlin.concat([]);
			if (player.ok != undefined) o.o = player.ok;
			if (player.checked != undefined) o.c = player.checked;
			if (player.stasi === true) o.s = 1;
			p.push(o);
		});
		obj.d = p;
	}
	if (this.workflow != undefined) {
		obj.e = [this.workflow.turn, this.workflow.phase, this.workflow.currentPlayer, this.workflow.decade];
		if (this.workflow.subphase != undefined) obj.e.push(this.workflow.subphase);
	}
	if (this.provinces != undefined) {
		var p = [];
		_.each(this.provinces, function(province) {
			var o = [];
			if (province != undefined) {
				if (province.unrest.length === undefined) o.push(province.unrest);
				else o.push(province.unrest.concat([]));
				if (province.ls.length === undefined) o.push(province.ls);
				else o.push(province.ls.concat([]));
				if (province.socialists != undefined) o.push(province.socialists)
			} else {
				o = undefined;
			}
			p.push(o);
		});
		obj.f = p;
	}
	if (this.socialists != undefined) obj.g = this.socialists;
	if (this.factories != undefined) obj.h = this.factories.concat([]);
	if (this.roads != undefined) obj.i = this.roads.concat([]);
	if (this.wall === true) obj.j = true;
	if (this.lines != undefined) obj.k = this.lines.concat([]);
	if (this.rundown != undefined) obj.l = this.rundown.concat([]);
	if (this.flight_icons != undefined) obj.m = this.flight_icons;
	if (this.discard != undefined) obj.n = this.discard.concat([]);
	if (this.berlin_supplier_MP != undefined) obj.o = this.berlin_supplier_MP.concat([]);
	if (this.context != undefined) obj.p = this.context.replace(/"/g, '\\"');
	if (this.logs != undefined && this.logs.length > 0) {
		obj.q = [];
		var now = new Date().getTime();
		obj.q.push(now);
		_.each(this.logs, function(log) {
			obj.q.push([
				now-log.timestamp,
				log.side,
				log.action,
				log.param != undefined ? log.param.concat([]) : []
			]);
		});
	}
	if (this.win != undefined) obj.r = this.win;

	return JSON.stringify(obj);
};

Game.prototype.load = function(obj) {

	if (obj.a != undefined) this.currentDeck = obj.a;
	else delete this.currentDeck;
	if (obj.b != undefined) this.cardRow = obj.b;
	else delete this.cardRow;
	if (obj.c != undefined) this.eastCard = obj.c;
	else delete this.eastCard;
	if (obj.d != undefined) {
		this.players = [];
		_.each(obj.d, function(entry) {
			var player = {};
			player.name = entry.n;
			player.hand = entry.h;
			if (entry.p != undefined) player.police = entry.p;
			if (entry.v != undefined) player.hamburg = entry.v;
			if (entry.b != undefined) player.toBerlin = entry.b;
			if (entry.o != undefined) player.ok = entry.o;
			if (entry.c != undefined) player.checked = entry.c;
			if (entry.s === 1) player.stasi = true;
			this.players.push(player);
		}, this);
	} else {
		delete this.players;
	}
	if (obj.e != undefined) {
		this.workflow = {
			turn: obj.e[0],
			phase: obj.e[1],
			currentPlayer: obj.e[2],
			decade: obj.e[3]
		}
		if (obj.e.length == 5) this.workflow.subphase = parseInt(obj.e[4]);
	} else {
		delete this.workflow;
	}
	if (obj.f != undefined) {
		this.provinces = [];
		_.each(obj.f, function(entry) {
			if (entry != undefined) {
				var province = {
					unrest: entry[0],
					ls: entry[1]
				};
				if (entry.length == 3) province.socialists = entry[2];
				this.provinces.push(province);
			} else {
				provinces.push(undefined);
			}
		}, this);
	} else {
		delete this.provinces;
	}
	if (obj.g != undefined) this.socialists = obj.g;
	else delete this.socialists;
	if (obj.h != undefined) this.factories = obj.h;
	else delete this.factories;
	if (obj.i != undefined) this.roads = obj.i;
	else delete this.roads;
	if (obj.j === true) this.wall = true;
	else delete this.wall;
	if (obj.k != undefined) this.lines = obj.k;
	else delete this.lines;
	if (obj.l != undefined) this.rundown = obj.l;
	else delete this.rundown;
	if (obj.m != undefined) this.flight_icons = obj.m;
	else delete this.flight_icons;
	if (obj.n != undefined) this.discard = obj.n;
	else delete this.discard;
	if (obj.o != undefined) this.berlin_supplier_MP = obj.o;
	else delete this.berlin_supplier_MP;
	if (obj.p != undefined) this.context = obj.p;
	else delete this.context;
	if (obj.q != undefined) {
		this.logs = [];
		for (var i = 1 ; i < obj.q.length ; i++) {
			this.logs.push({
				timestamp: obj.q[0] - obj.q[i][0],
				side: obj.q[i][1],
				action: obj.q[i][2],
				param: obj.q[i][3]
			});
		}
	} else {	
		delete this.logs;
	}
	if (obj.r != undefined) {
		this.win = obj.r;
	} else {
		delete this.win;
	}
};

Game.prototype.unrest = function(region, modifier, absolute) {
	if (absolute !== true) absolute = false;
	region = region - 50;
	if (this.provinces == undefined) this.provinces = [];

	var r;
	if (region === (R.WEST_BERLIN-50)) {
		if (this.provinces[region] == undefined) {
			r = this.createWestBerlin(0,[0,0,0]);
			this.provinces[region] = r;
		} else {
			r = this.provinces[region];
		}
	} else {
		if (this.provinces[region] == undefined) {
			r = this.createRegion(0,0);
			this.provinces[region] = r;
		} else {
			r = this.provinces[region];
		}
	}
	if (absolute !== true) r.unrest = r.unrest + modifier >= 0 ? r.unrest + modifier : 0;
	else r.unrest = modifier >= 0 ? modifier : 0;
};

Game.prototype.createRegion = function(unrest, ls, socialists) {
	var res = {};
	if (unrest !== undefined) res.unrest = unrest;
	if (ls !== undefined) res.ls = ls;
	if (socialists !== undefined) res.socialists = socialists;

	return res;
};

Game.prototype.createWestBerlin = function(unrest, ls, socialists) {
	var res = {};
	if (unrest !== undefined) res.unrest = unrest;
	if (ls !== undefined && ls.length != undefined) res.ls = ls;

	return res;
};

Game.prototype.livingStandard = function(region, modifier, absolute, berlin_district) {
	if (absolute !== true) absolute = false;
	region = region - 50;
	if (this.provinces == undefined) this.provinces = [];

	if (region === (R.WEST_BERLIN-50) && berlin_district != undefined && berlin_district < 3 && berlin_district >= 0) {
		var r;
		if (this.provinces[region] == undefined) {
			r = this.createWestBerlin(0,[0,0,0]);
			this.provinces[region] = r;
		} else {
			r = this.provinces[region];
		}
		if (absolute !== true) r.ls[berlin_district] = r.ls[berlin_district] + modifier >= 0 ? r.ls[berlin_district] + modifier : 0;
		else r.ls[berlin_district] = modifier >= 0 ? modifier : 0;
	} else {
		var r;
		if (this.provinces[region] == undefined) {
			r = this.createRegion(0,0);
			this.provinces[region] = r;
		} else {
			r = this.provinces[region];
		}
		if (absolute !== true) r.ls = r.ls + modifier >= 0 ? r.ls + modifier : 0;
		else r.ls = modifier >= 0 ? modifier : 0;
	}
};

Game.prototype.socialistsAction = function(region, modifier) {
	region = region - 50;
	if (this.provinces == undefined) this.provinces = [];

	var r;
	if (this.provinces[region] == undefined) {
		r = this.createRegion(0,0,0);
		this.provinces[region] = r;
	} else {
		r = this.provinces[region];
	}
	if (r.socialists == undefined) r.socialists = 0;

	if (modifier >=  0) {
		r.socialists += modifier;
		this.unrest(region, modifier*-1);
	} else {
		if (Math.abs(modifier) > r.socialists) modifier = r.socialists*-1;
		r.socialists += modifier;
		this.unrest(region, modifier*-1);
	}
};

Game.prototype.socialistsBox = function(modifier, absolute) {
	if (absolute !== true) absolute = false;
	if (this.socialists == undefined) this.socialists = 0;

	if (absolute === true) this.socialists = modifier >= 0 ? modifier : 0;
	else this.socialists = this.socialists+modifier >= 0 ? this.socialists+modifier : 0;
}

// give the mass protest markers number
Game.prototype.massProtest = function(region) {
	region = region - 50;
	if (this.provinces != undefined && this.provinces[region] != undefined && this.provinces[region].unrest != undefined) {
		return Math.floor(this.provinces[region].unrest/4);
	} 

	return 0;
}

Game.prototype.removeMassProtest = function(region) {
	region = region - 50;
	if (this.provinces != undefined && this.provinces[region] != undefined && this.provinces[region].unrest != undefined) {
		if (this.provinces[region].unrest > 3) this.provinces[region].unrest = 3;
	}
}

Game.prototype.berlinSupplierMassProtest = function(supplier, modifier) {
	if (this.berlin_supplier_MP == undefined) this.berlin_supplier_MP = [0,0,0];
	this.berlin_supplier_MP[supplier] = this.berlin_supplier_MP[supplier] + modifier >= 0 ? this.berlin_supplier_MP[supplier] + modifier : 0;
}

Game.prototype.removeFirstBerlinSupplierMassProtest = function() {
	if (this.berlin_supplier_MP != undefined) {
		for (var i = 0 ; i < this.berlin_supplier_MP.length ; i++) {
			if (this.berlin_supplier_MP[i] > 0) {
				this.berlin_supplier_MP[i]--;
				this.berlinSupplierMassProtest(i, -1);
				break;
			}
		}
	}
}

Game.prototype.buildFactory = function(city) {
	if (this.factories == undefined) this.factories = [];
	if (this.factories.indexOf(city) == -1) this.factories.push(city);
}

Game.prototype.removeFactory = function(city) {
	if (this.factories != undefined && this.factories.indexOf(city) > -1) {
		if (city != R.RHEINSBERG) {
			this.factories.splice(this.factories.indexOf(city),1);
			if (this.isRundown(city)) {
				this.rundown.splice(this.rundown.indexOf(city),1);
			}
		} else {
			if (this.isRundown(city)) {
				this.rundown.splice(this.rundown.indexOf(city),1);
				this.factories.splice(this.factories.indexOf(city),1);
			} else {
				this.rundownBuilding(city);
			}
		}
	}
}

Game.prototype.buildRoad = function(link) {
	var ref = Math.floor(link)
	if (this.roads == undefined) this.roads = [];

	if (ref != link) {
		var strict = _.map(this.roads, function(item) { return Math.floor(item)});
		var idx = strict.indexOf(ref);
		if (idx != -1) {
			var seg = Math.round((link - ref)*10);
			if (seg < 4) {
				var old = this.roads[idx];
				var seg_old = Math.round((old - ref)*10);
				var total = ref + 0.4;
				if (seg + seg_old == 3) this.roads.splice(idx,1,total);
			} else {
				this.roads.splice(idx,1,link);
			}
		}
		else this.roads.push(link);
	} else {
		if (this.roads.indexOf(link) == -1) this.roads.push(link);
	}
}

Game.prototype.removeRoad = function(link) {
	if (this.roads != undefined) {

		if (this.roads.indexOf(link) > -1) {
			this.roads.splice(this.roads.indexOf(link),1);
		} else {
			var strict = Math.floor(link);
			var total = strict + 0.4;
			var seg = Math.round((link - strict)*10);
			var idx = this.roads.indexOf(total);
			if (idx > -1) {
				var replacement = strict + 0.1;
				if (seg == 1) replacement = strict + 0.2;
				this.roads.splice(idx, 1, replacement);
			}
		}
	}
}

Game.prototype.rundownBuilding = function(city) {
	if (this.rundown == undefined) this.rundown = [];
	if (this.rundown.indexOf(city) == -1 && this.factories != undefined && this.factories.indexOf(city) > -1) this.rundown.push(city);
	else if (this.rundown.indexOf(city) != -1 && this.factories != undefined &&  this.factories.indexOf(city) > -1 && city == R.RHEINSBERG) this.removeFactory(city);
}

Game.prototype.repairBuilding = function(city) {
	if (this.isRundown(city)) {
		this.rundown.splice(this.rundown.indexOf(city), 1);
	}
}

Game.prototype.isRundown = function(city) {
	if (this.factories != undefined && this.factories.indexOf(city) > -1 && this.rundown != undefined && this.rundown.indexOf(city) > -1) return true;
	else return false;
} 

Game.prototype.useCard = function(obj) {
	if (this.discard == undefined) this.discard = [];
	if (obj.hand === true) {
		var side = this.workflow.currentPlayer;
		this.discard.push(this.players[side-1].hand.splice(obj.rank,1)[0]);
	} else if (obj.card == this.eastCard) {
		this.discard.push(this.eastCard);
		delete this.eastCard;
	} else {
		this.discard.push(this.cardRow.splice(obj.rank,1)[0]);
	}
}

Game.prototype.roadExists = function(road) {
	if (this.roads != undefined) {
		var strict = Math.floor(road);
		var deux = strict != road;
		if (!deux) return (this.roads.indexOf(road) > -1);
		else {
			var total = strict + 0.4;
			if (this.roads.indexOf(total) > -1) return true;
			else {
				return (this.roads.indexOf(road) > -1);
			}
		}
	}

	return false;
}

Game.prototype.firstHalfOfDecade = function() {
	if (this.currentDeck != undefined) {
		return this.currentDeck.length > 6;
	}
}

Game.prototype.remainingTurn = function() {
	if (this.cardRow != undefined) {
		return this.cardRow.length > 0;
	}
	return false;
}

Game.prototype.startEndOfDecade = function() {
	delete this.cardRow;
	delete this.players[0].hamburg;
	delete this.context;
	this.workflow.phase = R.END_OF_DECADE;
	this.workflow.subphase = 1;
}

Game.prototype.nextDecade = function() {
	if (this.workflow.decade < 4) {
		this.workflow.decade++;
		this.workflow.phase = R.ACTION_PHASE;
		this.currentDeck = R.giveInitDeckDecade(this.workflow.decade);
		this.cardRow = this.currentDeck.splice(0,7);
		this.eastCard = parseInt(80 + this.workflow.decade);
		if (this.workflow.decade == 4 && this.wall == true) this.eastCard = 85;
		delete this.discard;
		for (var i = 0 ; i < 2 ; i++) {
			var p = this.players[i];
			delete p.ok;
			if (p.hand == undefined) p.hand = [];
			while (p.hand.length < 2) p.hand.push(this.currentDeck.splice(0,1)[0]);
		}
		if (this.lines[0] > 0) this.workflow.currentPlayer = R.EAST;
		else this.workflow.currentPlayer = R.WEST;
	}
}

Game.prototype.nextPlayer = function() {
	this.workflow.currentPlayer = this.workflow.currentPlayer%2+1;
}

Game.prototype.modifyLines = function(modifier) {
	var depassement = [0,0,0];
	if (modifier != undefined && modifier.length == 3) {
		if (this.lines == undefined) this.lines = [0,0,0];
		for (var i = 0 ; i < 3 ; i++) {
			var movement = Math.abs(this.lines[i] + modifier[i]);
			if (movement > 6) {
				depassement[i] = movement - 6;
				if (modifier[i] < 0) {
					depassement[i] *= -1;
					this.lines[i] = -6;
				} else {
					this.lines[i] = 6;
				}
			} else {
				this.lines[i] += modifier[i];
			}
		}
	}
	return depassement;
}

Game.prototype.addPoliceToEast = function(nb, pink) {
	if (this.players[1].police == undefined) {
		this.players[1].police = [0,0,0];
	}
	if (pink === true) {
		this.players[1].police[1] += nb;	
	} else {
		this.players[1].police[0] += nb;
	}
}

Game.prototype.usePolice = function() {
	if (this.players[1].police != undefined) {
		this.players[1].police[2]++;
	}
}

Game.prototype.saveContext = function(context) {
	this.context = JSON.stringify(context);
}

Game.prototype.loadContext = function() {
	if (this.context != undefined) return JSON.parse(this.context);
	else return undefined;
}

Game.prototype.deleteContext = function() {
	delete this.context;
}

Game.prototype.prestigeLeader = function() {
	if (this.lines[0] > 0) return R.EAST;
	else return R.WEST;
}

Game.prototype.lsForProvince = function(province) {
	province = province - 50;
	if (this.provinces != undefined && this.provinces[province] != undefined) {
		if (this.provinces[province].ls != undefined) {
			if (!isNaN(this.provinces[province].ls)) {
				return this.provinces[province].ls;
			} else {
				return _.sum(this.provinces[province].ls);
			}
		}
	}

	return 0;
}

Game.prototype.endGame = function(cause) {
	if (cause == undefined) cause = R.FULL_GAME;
	this.win = cause;
	this.workflow.phase = R.END_OF_GAME;
}