var Rules = {
	factoriesStrength: function(game) {

		var res = new Array(42);
		_.fill(res,0);

		if (game.factories != undefined) {
			_.each(game.factories, function(factory) {
				if ((factory-1) < res.length) {
					res[factory-1] = 1 + this.nbWorkingConnectionsForFactory(factory, game);
					if (game.isRundown(factory)) res[factory-1] -= 1;
					if (factory == R.RHEINSBERG) res[factory-1] += 1;
				}
			}, this);
		}

		return res;
	},

	nbWorkingConnectionsForFactory: function(index, game) {
		return this.workingConnectionsForFactory(index, game).length;
	},

	workingConnectionsForFactory: function(index, game) {
		var res = [];

		var cnx = this.connectionsStartingFrom(index);
		_.each(cnx, function(c) {
			var liaison = R.roads[c];
			var longue = liaison.length == 3;
			var autre = index == liaison[0] ? liaison[1] : liaison[0];
			var autreExists = game.factories.indexOf(autre) > -1;
			var routeExists = game.roads != undefined && game.roads.indexOf(c) > -1;
			if (longue) {
				routeExists = game.roads != undefined && game.roads.indexOf(c+0.4) > -1;
			}

			if (autreExists === true && routeExists === true) res.push(c);
		});

		return res;
	},

	nbInfrastructuresStartingFromFactory: function(index, game) {
		return this.infrastructuresStartingFromFactory(index,game).length;
	},

	infrastructuresStartingFromFactory: function(index, game) {
		var res = [];

		var cnx = this.connectionsStartingFrom(index);
		_.each(cnx, function(c) {
			var liaison = R.roads[c];
			var longue = liaison.length == 3;
			var routeExists = game.roads != undefined && game.roads.indexOf(c) > -1;
			if (longue) {
				routeExists = game.roads != undefined && game.roads.indexOf(c+0.4) > -1;
				if (routeExists === true) {
					if (liaison[0] == index) {
						res.push(c+0.1);
					} else if (liaison[1] == index) {
						res.push(c+0.2);
					}
				} else  {
					if (liaison[0] == index && game.roads != undefined && game.roads.indexOf(c+0.1) > -1) {
						routeExists = true;
						res.push(c+0.1);
					} else if (liaison[1] == index && game.roads != undefined && game.roads.indexOf(c+0.2) > -1) {
						routeExists = true;
						res.push(c+0.2);
					}
				}
			} else {
				if (routeExists === true) res.push(c);
			}

			
		});

		return res;
	},

	nbFactoriesBuildOnThisRoad: function(game, link) {
		var r = R.roads[Math.floor(link)];

		var nb = 0;

		if (r.length == 2) {
			if (game.factories != undefined && game.factories.indexOf(r[0]) > -1) nb++;
			if (game.factories != undefined && game.factories.indexOf(r[1]) > -1) nb++;
		} else {
			var seg = Math.round((link - Math.floor(link))*10);
			if (seg == 4) {
				if (game.factories != undefined && game.factories.indexOf(r[0]) > -1) nb++;
				if (game.factories != undefined && game.factories.indexOf(r[1]) > -1) nb++;
			} else if (seg == 1) {
				if (game.factories != undefined && game.factories.indexOf(r[0]) > -1) nb++;
			} else if (seg == 2) {
				if (game.factories != undefined && game.factories.indexOf(r[1]) > -1) nb++;
			}
		}

		return nb;
	},

	connectionsStartingFrom: function(index) {
		var res = [];
		for (var i = 0 ; i < R.roads.length ; i++) {
			if (R.roads[i].indexOf(index) > -1) res.push(i);
		}
		return res;
	},

	massProtestMakers: function(game) {
		var res = new Array(14);
		_.fill(res, 0);

		if (game.provinces != undefined) {
			for (var i = 0 ; i < game.provinces.length ; i++) {
				var unrest = game.provinces[i].unrest;
				res[i] = Math.floor(unrest/4);
			
				if (game.berlin_supplier_MP != undefined) {
					if (i == (R.NORDRHEIN_WESTFALEN - 50)) res[i] += game.berlin_supplier_MP[1];
					if (i == (R.RHEINLAND_PFALZ - 50)) res[i] += game.berlin_supplier_MP[0];
					if (i == (R.BADEN_WURTTEMBERG - 50)) res[i] += game.berlin_supplier_MP[2];
				}
			}
		}

		return res;
	},

	massProtestMakersForProvince: function(game, province) {
		return this.massProtestMakers(game)[province - 50];
	},

	possibleProvincesForUnrestRemoval: function(game, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];
		if (game.provinces == undefined) return res;

		if  (side == R.WEST) {
			for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.WEST_BERLIN ; i++) {
				var idx = i - 50;
				if (game.provinces[idx].unrest != undefined && game.provinces[idx].unrest > 0) {
					res.push(i);
				}
			}
		} else {
			for (var i = R.MECKLENBURG_VORPOMMERN ; i <= R.THURINGEN ; i++) {
				var idx = i - 50;
				if (game.provinces[idx].unrest != undefined && game.provinces[idx].unrest > 0) {
					res.push(i);
				}
			}
		}
		return res;
	},

	possibleSpotsForDismantle: function(game, side, restriction) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = {};

		var only = restriction;
		var hamburg = false;
		if (restriction != undefined && restriction.length != undefined) {
			only = restriction[0];
			hamburg = true;
		}

		if (game.factories != undefined) {
			_.each(game.factories, function(factory) {
				if (R.sideForCity(factory) == side) {
					if (only == undefined || R.provinceForCity(factory) == only || (hamburg === true && factory == hamburg) ) {
						if (this.nbInfrastructuresStartingFromFactory(factory, game) == 0 && (game.isRundown(factory) === false || factory == R.RHEINSBERG)) {
							if (res.factories == undefined) res.factories = [];
							res.factories.push(factory);
						}
					}
				}
			}, this);
		}
		if (game.roads != undefined) {
			res.roads = [];
			_.each(game.roads, function(road) {
				var ref = Math.floor(road);
				var deux = ref != road;
				if (R.sideForRoad(ref) == side) {
					if (only == undefined || R.provincesForRoad(ref).indexOf(only) != -1) {
						if (!deux) res.roads.push(road);
						else {
							var seg = Math.round((road - ref)*10);
							if (seg == 4) {
								res.roads.push(ref+0.1);
								res.roads.push(ref+0.2);
							} else {
								res.roads.push(road);
							}
						}
					}
				}
			}, this);
		}
	 

		return res;
	},

	possibleSpotsForStopFactories: function(game, side, restriction) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];

		if (game.factories != undefined) {
			_.each(game.factories, function(factory) {
				if (R.sideForCity(factory) == side) {
					if (restriction == undefined) {
						res.push(factory);
					} 
				} else {
					if (restriction == R.POLSKA && (factory == R.POLSKA_N || factory == R.POLSKA_S)) {
						res.push(factory);
					}
					if (restriction == R.CSSR && (factory == R.CSSR_N || factory == R.CSSR_S)) {
						res.push(factory);
					}
				}
			}, this);
		}

		return res;
	},

	possibleSpotsForRundown: function(game) {
		var res = [];

		_.each(game.factories, function(factory) {
			if ((!game.isRundown(factory)) && R.sideForCity(factory) == R.EAST) res.push(factory);
		});

		return res;
	},

	possibleSpotsForRepair: function(game, restriction) {
		var res = [];

		_.each(game.factories, function(factory) {
			if (game.isRundown(factory)) {
				if (restriction == undefined) {
					res.push(factory);
				} else {
					if (R.provinceForCity(factory) == restriction) {
						res.push(factory);
					}
				}
			} 
		});

		return res;
	},

	performStopFactory: function(game, factory) {
		var roads = this.infrastructuresStartingFromFactory(factory, game);

		_.each(roads, function(road) {
			game.removeRoad(road);
		});
		game.removeFactory(factory);
	},

	possibleSpotsForBuild: function(game, side, restriction) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = {
			factories: [],
			roads: []
		};

		if (restriction == undefined) {
			for (var i = R.FLENSBURG ; i <= R.JENA ; i++) {
				if (this.massProtestMakersForProvince(game,R.provinceForCity(i)) == 0 && 
					R.sideForCity(i) == side && game.factories.indexOf(i) == -1 && i != R.RHEINSBERG) res.factories.push(i);
			}


			for (var i = 0 ; i < R.roads.length;  i ++) {
				if (R.sideForRoad(i) == side && this.isRoadSpotFreeOfMassProtest(game,i)) {
					if (R.roads[i].length == 2 && this.nbFactoriesBuildOnThisRoad(game, i) > 0) {
						if (game.roads == undefined || game.roads.indexOf(i) == -1) {
							res.roads.push(i);
						}
					} else {
						var s1 = i+0.1;
						var s2 = i+0.2;
						var s4 = i+0.4;
						if (game.roads == undefined) {
							if (this.nbFactoriesBuildOnThisRoad(game, s1) > 0) res.roads.push(s1);
							if (this.nbFactoriesBuildOnThisRoad(game, s2) > 0) res.roads.push(s2);
						} else {
							if (game.roads.indexOf(s1) > -1) res.roads.push(s2);
							else if (game.roads.indexOf(s2) > -1) res.roads.push(s1);
							else if (game.roads.indexOf(s4) == -1) {
								if (this.nbFactoriesBuildOnThisRoad(game, s1) > 0) res.roads.push(s1);
								if (this.nbFactoriesBuildOnThisRoad(game, s2) > 0) res.roads.push(s2);
							}
						}
					}
				}
			} 
		} else {
			if (restriction == R.RHEINSBERG) {
				if (this.massProtestMakersForProvince(game,R.provinceForCity(R.RHEINSBERG)) == 0 && game.factories.indexOf(R.RHEINSBERG)) {
					res.factories.push(R.RHEINSBERG);
				}
			} else if (restriction == R.POLSKA) {
				if (game.factories.indexOf(R.POLSKA_N) == -1) res.factories.push(R.POLSKA_N);
				if (game.factories.indexOf(R.POLSKA_S) == -1) res.factories.push(R.POLSKA_S);

				for (var i = R.POLSKA_N ; i <= R.POLSKA_S ; i++) {
					var roads = this.connectionsStartingFrom(i);
					for (var j = 0 ; j < roads.length ; j++) {
						if ((game.roads == undefined || game.roads.indexOf(roads[j]) == -1) && this.nbFactoriesBuildOnThisRoad(game, roads[j]) > 0 && this.isRoadSpotFreeOfMassProtest(game,roads[j])) res.roads.push(roads[j]);
					}
				}
				
			} else if (restriction == R.CSSR) {
				if (game.factories.indexOf(R.CSSR_N) == -1) res.factories.push(R.CSSR_N);
				if (game.factories.indexOf(R.CSSR_S) == -1) res.factories.push(R.CSSR_S);

				for (var i = R.CSSR_N ; i <= R.CSSR_S ; i++) {
					var roads = this.connectionsStartingFrom(i);
					for (var j = 0 ; j < roads.length ; j++) {
						if ((game.roads == undefined || game.roads.indexOf(roads[j]) == -1) && this.nbFactoriesBuildOnThisRoad(game, roads[j]) > 0 && this.isRoadSpotFreeOfMassProtest(game,roads[j])) res.roads.push(roads[j]);
					}
				}
			}
		}

		return res;
	},

	possibleSpotsForUnrest: function(game, restriction, max, placedThisTurn, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		if  (placedThisTurn == undefined) placedThisTurn = [];
		var nbplaced = _.countBy(placedThisTurn, function(n) {return n});

		var res = [];
		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			if (R.sideForProvince(i) == side) {
				var nb = 0;
				if (nbplaced != undefined) nb = nbplaced[i];
				if (max == undefined || nb == undefined || nb < max) {
					if (restriction == undefined) {
						res.push(i);
					} else {
						if (restriction == R.WEST_GERMANY && i != R.WEST_BERLIN) {
							res.push(i);
						} else if (!isNaN(restriction)) {
							if (i == restriction) res.push(i);
						} else if (restriction.length != undefined && restriction.indexOf(i) > -1) {
							res.push(i);
						}
					}
				}
			}
		}

		return res;
	},


	possibleProvincesForUnrestMovement: function(game, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];
		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			var unVal = 0;
			if (game.provinces[i-50] != undefined && game.provinces[i-50].unrest != undefined) {
				unVal = game.provinces[i-50].unrest;
			}
			if (R.sideForProvince(i) == side && unVal > 0) {
				res.push(i);
			}
		}

		return res;
	},


	possibleSpotsForRemoveUnrest: function(game, restriction, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];
		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			var unVal = 0;
			if (game.provinces[i-50] != undefined && game.provinces[i-50].unrest != undefined) {
				unVal = game.provinces[i-50].unrest;
			}
			if (R.sideForProvince(i) == side && unVal > 0) {
				if (restriction == undefined) {
					res.push(i);
				} else {
					if (restriction == R.WEST_GERMANY && i != R.WEST_BERLIN) {
						res.push(i);
					} else if (i == restriction) {
						res.push(i);
					}
				}
			}
		}

		return res;
	},

	possibleSpotsForRemoveMassProtest: function(game, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var mp = this.massProtestMakers(game);

		var res = [];
		for (var i = 0 ; i <= mp.length ; i++) {
			if (R.sideForProvince(i+50) == side && mp[i] > 0) {
				res.push(i+50);
			}
		}

		return res;
	},

	isRoadSpotFreeOfMassProtest: function(game, road) {
		var p = R.provincesForRoad(road);
		var free = true;

		for (var i = 0 ; i < p.length ; i++) {
			free = free && (this.massProtestMakersForProvince(game, p[i]) == 0);
			if (!free) break;
		}

		return free;

	},

	economy: function(game) {
		var res = new Array(14);
		_.fill(res, 0);

		var strength = this.factoriesStrength(game);
		this.computeExternalFactoriesPowerToEconomy(game);
		var ext = game.players[1].externalFactories;
		for (var i = 0 ; i < strength.length ; i++) {
			var p = R.provinceForCity(i+1);
			if (p > -1) {
				res[p-50] += strength[i];
			}
		}

		for (var i = 0 ; i < ext.length ; i++) {
			if (ext[i] > -1) {
				res[ext[i]-50] += strength[i + R.POLSKA_N-1];
			}
		}
		return res;
	},

	exportFactories: function(game) {
		var res = new Array(14);
		_.fill(res, -1);

		var strength = this.factoriesStrength(game);
		for (var i = 0 ; i < strength.length ; i++) {
			var force = strength[i];
			var province = R.provinceForCity(i+1);
			if (res[province-50] < force && game.factories.indexOf(i+1) != -1) res[province-50] = force;
		};

		return res;
	},

	pointsNeededToBuildLs: function(game) {
		var eco = this.economy(game);

		var res = [];
		if (game.provinces != undefined) {
			for (var i = 0 ; i < game.provinces.length ; i++) {
				var ls = 0;
				if (i === R.WEST_BERLIN - 50) {
					if (game.provinces[i].ls != undefined) ls = _.sum(game.provinces[i].ls);
				} else {
					if (game.provinces[i].ls != undefined) ls = game.provinces[i].ls;
				}
				res[i] = 3*(ls+1) - eco[i];
				if (res[i] < 0) res[i] = 0;
			}
		} 

		return res;
	},

	possibleProvincesForLs: function(game, bonus, placedThisTurn, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		if (placedThisTurn == undefined) placedThisTurn = [];

		var ref = this.pointsNeededToBuildLs(game);
		var res = [];
		for (var i = 0 ; i < ref.length ; i++) {
			if (placedThisTurn.indexOf(50+i) == -1 && R.sideForProvince(50+i) == side) {
				if (ref[i] == 0 || ref[i] <= bonus) {
					res.push(50+i);
				}
			}
		}
		return res;
	},

	possibleProvincesForFreeLs: function(game, restriction, placedThisTurn, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		if (placedThisTurn == undefined) placedThisTurn = [];

		var res = [];
		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			if (placedThisTurn.indexOf(i) == -1 && R.sideForProvince(i) == side) {
				if (restriction != undefined) {
					if (restriction == R.WEST_GERMANY) {
						if (i < R.WEST_BERLIN) {
							res.push(i);
						}
					} else {
						if (i == restriction) res.push(i);
					}
				} else {
					if (i != R.WEST_BERLIN) res.push(i);
					else {
						var min = 0;
						var max = 0;
						if (game.provinces[R.WEST_BERLIN - 50].ls != undefined) {
							min = _.min(game.provinces[R.WEST_BERLIN - 50].ls);
							max = _.max(game.provinces[R.WEST_BERLIN - 50].ls);
						}
						for (var j = 1 ; j <= 3 ; j++) {
							if (min == max || game.provinces[R.WEST_BERLIN - 50].ls[j-1] == min) res.push(R.WEST_BERLIN*10 + j);
						}
					}
				}
			}
		}
		return res;
	},

	possibleProvincesForRemoveLs: function(game, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];
		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			if (R.sideForProvince(i) == side && game.provinces[i-50].ls != undefined && game.provinces[i-50].ls > 0) {
				res.push(i);
			}
		}
		return res;
	},

	ambiguousExternalFactories: function(game, pov, side) {
		if (side == undefined) side = game.workflow.currentPlayer;

		var res = [];

		if (side == R.EAST && (pov == R.DUAL || pov == R.EAST)) {
			for (var i = R.POLSKA_N ; i <= R.CSSR_S ; i++) {
				if (game.factories.indexOf(i) > -1) {

					if (this.nbWorkingConnectionsForFactory(i,game) == 2) {
						res.push(i);
					}
				}
			}
		}

		return res;
	},

	computeExternalFactoriesPowerToEconomy: function(game) {
		
		var p = game.players[1];
		if (p.externalFactories == undefined) p.externalFactories = [-1,-1,-1,-1];

		for (var i = R.POLSKA_N ; i <= R.CSSR_S ; i++) {
			if (game.factories.indexOf(i) > -1) {
				var r = this.workingConnectionsForFactory(i, game);
				if (r.length == 1) {
					var startingProvince = R.provinceForCity(R.roads[r[0]][0]);
					p.externalFactories[i-R.POLSKA_N] = startingProvince;
				}
			}
		}
	},

	giveFlightIconsInDiscard: function(game) {
		var icons = 0;
		if (game.discard != undefined) {
			_.each(game.discard, function(card) {
				var c = R.cards[card];
				if (c.flight != undefined) icons += c.flight;
			});
		}
		return icons;
	},

	computeFlightLevel: function(game) {
		var icons = this.giveFlightIconsInDiscard(game);

		var maxLsInWest = _.reduce(_.slice(game.provinces, 0, 8), function(max, item) {
			var nb = 0;
			if (!isNaN(item.ls)) nb = item.ls;
			else if (item.ls.length != undefined) {
				nb = _.sum(item.ls);
			}

			return Math.max(max, nb);

		}, 0);

		icons += maxLsInWest;

		var mp = this.massProtestMakers(game);

		if (_.sum(_.slice(mp, 8, 14)) > 0) {
			icons++;
		}

		var minLsInEast = _.min(_.slice(game.provinces, 8, 14), 'ls').ls;

		icons -= minLsInEast;

		if (_.sum(_.slice(mp, 0, 8)) > 0) {
			icons--;
		}

		if (game.players[1].police != undefined) icons += game.players[1].police[0];

		return Math.max(icons,0);
	},

	nbDismantleForEoD01: function(game) {
		return Math.floor(this.computeFlightLevel(game)/2);
	},


	nbDismantleForEoD04: function(game) {
		var res = 0;
		if (game.players[1].police != undefined) {
			res += game.players[1].police[0];
			res += game.players[1].police[1];
		}
		return res;
	},

	westernCurrency: function(game) {
		var wc = game.lines[1];

		var exFac = this.exportFactories(game);
		var worst = _.min(_.slice(exFac,0,7));
		if (worst < 0) worst = 0;
		var e = _.reduce(_.slice(exFac,8,14), function(total, fac) {
			if (fac >= worst) return total + 1;
			return total;
		}, 0);
		wc += e;

		var lsForEast =  _.sum(_.pluck(_.slice(game.provinces,8,14),'ls'));
		wc -= lsForEast;

		var logParam = [wc, game.lines[1], lsForEast, worst, e];
		Log.log(game, R.EAST, Log.A.westernCurrency, logParam);

		return Math.abs(Math.min(wc,0));
	},

	eventsForEndOfDecadeStep: function(game) {
		var pipe = [];
		if (game.workflow.phase == R.END_OF_DECADE) {
			switch (game.workflow.subphase) {
				case 1: 
					if (game.wall !== true) {
						var nb = this.nbDismantleForEoD01(game);

						Log.log(game, undefined, Log.A.dismantle_required, [nb]);
						if (nb > 0) {
							for (var i = 0; i < nb; i++) {
								pipe.push({
									symbol: R.DISBAND_E,
									player: 2 - (game.prestigeLeader() + i) % 2
								});
							}
							game.workflow.currentPlayer = pipe[0].player;
						}

					} else {
						Log.log(game, undefined, Log.A.dismantle_for_wall);
						pipe.push({
							symbol: R.DISBAND_E,
							player: R.EAST
						});
						if (G.lines != undefined && G.lines[0] <= -6) {
							pipe.push({
								symbol: R.BONUS_PRESTIGE_W,
								player: R.WEST
							});
						}
						game.workflow.currentPlayer = R.EAST;
					}
					break;
				case 2:
					break;
				case 3:
					var nb = this.westernCurrency(game);
					var run = this.rundownableFactoriesForEast(game);

					if (nb == 0) {
						Log.log(game, undefined, Log.A.rundown_needed, [nb]);
					} else {
						if (run > nb) {
							Log.log(game, undefined, Log.A.rundown_needed, [nb]);
							game.workflow.currentPlayer = R.EAST;
							for (var i = 0 ; i < nb ; i++) {
								pipe.push({
									symbol: R.RUNDOWN_FACTORY_E,
									player: 2 - (game.prestigeLeader() + i)%2
								});
							}
							game.workflow.currentPlayer = pipe[0].player;
						} else {
							nb -= this.rundownAllFactoriesForEast(game);
							Log.log(game, undefined, Log.A.rundown_needed, [nb, true]);
							var eastRoads = [];
							if (game.roads != undefined) eastRoads = _.filter(game.roads, function(road) {return road >= 42});
							var nbDismanle = this.nbDismantlePointForRheinsberg(game) + eastRoads.length;
							if (nb >= nbDismanle) {

								if (game.roads != undefined) game.roads = _.reject(game.roads, function(road) {return road >= 42});
								if (game.factories.indexOf(R.RHEINSBERG) > 1) {
									if (game.isRundown(R.RHEINSBERG)) {
										game.rundown.splice(game.rundown.indexOf(R.RHEINSBERG),1);
									}
									game.factories.splice(game.factories.indexOf(R.RHEINSBERG),1);
								}

								if (nb > nbDismanle) {
									pipe.push({
										symbol: R.END_OF_GAME,
										cause: R.NATIONAL_INSOLVENCY
									});
								}
								nb = 0;
							} else {
								for (var i = 0; i < nb; i++) {
									pipe.push({
										symbol: R.DISBAND_E,
										player: 2 - (game.prestigeLeader() + i) % 2
									});
								}
								if (nb > 0) game.workflow.currentPlayer = pipe[0].player;
							}
						}
					}
					break;
				case 4:
					var nb = this.nbDismantleForEoD04(game);
					if (nb > 0) {
						Log.log(game, undefined, Log.A.dismantle_required_eod04, [nb]);
						game.workflow.currentPlayer = R.EAST;
					} else {
						Log.log(game, undefined, Log.A.dismantle_required_eod04, [nb]);
					}
					for (var i = 0 ; i < nb ; i++) {
						pipe.push({
							symbol: R.DISBAND_E,
							player: R.EAST
						});
					}
					break;
				case 5:
					pipe = this.removeExcessLsForEoD05(game);
					break;
				case 6:
					var initBerlinMP = Rules.massProtestMakersForProvince(game, R.WEST_BERLIN);
					this.removeExcessLsForEoD06(game);
					if (Rules.massProtestMakersForProvince(game, R.WEST_BERLIN) > initBerlinMP) {
						pipe.push({
							symbol: R.ADD_SUPPLIER_MP,
							player: R.EAST
						});
					}
					break;
				case 7:
					pipe.push({
						symbol: R.PLACE_UNREST_E,
						player: R.WEST,
						restriction: []
					});
					break;
				case 8:
					if (game.players[1].police != undefined && game.players[1].police.length == 3) {
						var nb = game.players[1].police[0] + game.players[1].police[1] - game.players[1].police[2];
						if (nb > 0) {
							Log.log(game, undefined, Log.A.police_cards_left, [nb]);
							for (var i = 0 ; i < nb ; i++) {
								pipe.push({
									symbol: R.REMOVE_UNREST_E,
									player: R.EAST
								});
							}
							game.workflow.currentPlayer = R.EAST;
						}
					}
					break;
				case 9:
					if (game.lines != undefined && game.lines[2] != undefined) {
						var nb = _.sum(_.pluck(game.provinces, 'socialists'));
						var nbSoc = game.socialists;
						if (game.lines[2] == 0) {
							var need = Rules.useSocialists(game);
							if (need > 0) {
								for (var i = 0; i < game.socialists; i++) {
									pipe.push(R.ADD_SOCIALISTS);
								}
								game.workflow.currentPlayer = R.EAST;
							}
						}else if (game.lines[2] > 0) {
							var nbAdd = R.socialistsLine[game.lines[2] - 1];
							if ((nbSoc + nbAdd) > (12-nb)) {
								pipe.push({
									symbol: R.END_OF_GAME,
									cause: R.TRIUMPH_OF_SOCIALISM
								});
							} else {
								Log.log(game, undefined, Log.A.socialists_gain_loss, [nbAdd]);
								game.socialistsBox(nbAdd);
								var need = Rules.useSocialists(game);
								if (need > 0) {
									for (var i = 0; i < game.socialists; i++) {
										pipe.push(R.ADD_SOCIALISTS);
									}
									game.workflow.currentPlayer = R.EAST;
								}
							}
						} else if (game.lines[2] < 0) {
							var nbRemove = R.socialistsLine[-1*game.lines[2] - 1];
							if (nbRemove <= nbSoc) {
								Log.log(game, undefined, Log.A.socialists_gain_loss, [-nbRemove]);
								game.socialistsBox(-1*nbRemove);
							} else {
								if (nbRemove > (nb + nbSoc)) {
									pipe.push({
										symbol: R.END_OF_GAME,
										cause: R.SOCIALISM_FAILS
									});
								} else {
									Log.log(game, undefined, Log.A.socialists_gain_loss, [-nbRemove]);
									game.socialistsBox(0, true);
									game.workflow.currentPlayer = R.WEST;
									for (var i = 0 ; i < (nbRemove - nbSoc) ; i++) {
										pipe.push({
											symbol: R.REMOVE_SOCIALISTS,
											player: R.WEST
										});
									}
								}
							}
						}
					}
					break;
				case 10:
					var mp = this.massProtestMakers(game); 
					var mpE = 0;
					var mpW = 0;
					for (var i = 0 ; i < mp.length ; i++) {
						if (i < (R.MECKLENBURG_VORPOMMERN-50)) mpW += mp[i];
						else mpE += mp[i];
					}
					if (mpE >= 4 && mpW >= 4) {
						pipe.push({
							symbol: R.END_OF_GAME,
							cause: R.DOUBLE_COLLAPSE
						});
					} else if (mpE >= 4) {
						pipe.push({
							symbol: R.END_OF_GAME,
							cause: R.EAST_COLLAPSE
						});
					} else if (mpW >= 4) {
						pipe.push({
							symbol: R.END_OF_GAME,
							cause: R.WEST_COLLAPSE
						});
					} else {
						Log.log(game, undefined, Log.A.no_winner);
					}
					break;
			}
		}
		return pipe;
	},

	dismantlePrestigeForWest: function(game) {

		var run = this.rundownableFactoriesForEast(game);
		if (run <= 0) {
			return R.DISBAND_E;
		} else {
			return R.RUNDOWN_FACTORY_E;
		}

	},

	rundownableFactoriesForEast: function(game) {
		var res = 0;

		_.each(game.factories, function(factory) {
			if (R.sideForCity(factory) == R.EAST && !game.isRundown(factory) ) {
				res++;
			}
		});

		return res;
	},

	nbDismantlePointForRheinsberg: function(game) {
		if (game.factories.indexOf(R.RHEINSBERG) > -1) {
			if (game.isRundown(R.RHEINSBERG)) return 1;
			else return 2;
		} else {
			return 0;
		}
	},

	nbDismantleForEast: function(game) {
        var eastRoads = [];
        if (game.roads != undefined) eastRoads = _.filter(game.roads, function(road) {return road >= 42});
        var nbDismanle = this.nbDismantlePointForRheinsberg(game) + eastRoads.length;
        nbDismanle += this.rundownableFactoriesForEast(game);

        return nbDismanle;
	},

	rundownAllFactoriesForEast: function(game) {
		var res = 0;

		_.each(game.factories, function(factory) {
			if (R.sideForCity(factory) == R.EAST && !game.isRundown(factory)) {
				game.rundownBuilding(factory);
				res++;
			}
		});

		return res;
	},

	removeExcessLsForEoD05: function(game) {
		var res = [];
		var exFac = this.exportFactories(game);
		var ls = _.map(game.provinces,function(p) {
			if (!isNaN(p.ls)) return p.ls;
			else return _.sum(p.ls);
		});
		for (var i = 0 ; i < ls.length ; i++) {
			if (i != (R.WEST_BERLIN-50)) {
				if (exFac[i] == -1) exFac[i] = 0;
				if (ls[i] > exFac[i]) {
					game.provinces[i].ls = exFac[i];
					Log.log(game, game.workflow.currentPlayer, Log.A.reduce_ls_eod05, [i + 50]);
				}
			} else {
				var worst = Math.max(0,this.giveWorstExportFactoryValueForBerlin(game));
				var dis = [];
				if (worst < game.lsForProvince(R.WEST_BERLIN)) {
					for (var j = 0 ; j < game.provinces[R.WEST_BERLIN-50].ls.length ; j++) {
						if (game.provinces[R.WEST_BERLIN-50].ls[j] > 0) dis.push(R.WEST_BERLIN*10+(j+1));
					}
					Log.log(game, game.workflow.currentPlayer, Log.A.reduce_ls_wb_eod05);
					res.push({
						symbol: R.REMOVE_LS_W,
						player: R.WEST,
						restriction: dis
					});
				}
			}
		}

		return res;
	},

	giveWorstExportFactoryValueForBerlin : function(game) {
		var min = 99;
		var providers = [R.NORDRHEIN_WESTFALEN, R.RHEINLAND_PFALZ, R.BADEN_WURTTEMBERG];
		var exFac = this.exportFactories(game);
		var already = game.players[0].toBerlin;
		if (already != undefined) {
			_.each(providers, function(provider) {
				if (already.indexOf(provider) > -1) {
					min = Math.min(min, exFac[provider-50]);
				}
			});
		}
		return min;
	},

	removeExcessLsForEoD06: function(game) {
		var maxLsInWest = _.reduce(_.slice(game.provinces, 0, 8), function(max, item) {
			var nb = 0;
			if (!isNaN(item.ls)) nb = item.ls;
			else if (item.ls.length != undefined) {
				nb = _.sum(item.ls);
			}

			return Math.max(max, nb);

		}, 0);
		var maxLsInEast = _.max(_.slice(game.provinces, 8, 14), 'ls').ls;

		for (var i = R.SCHLESWIG_HOLSTEIN ; i <= R.THURINGEN ; i++) {
			if (i == R.WEST_BERLIN) {
				var val = _.sum(game.provinces[R.WEST_BERLIN-50].ls);
				var diff = comp - val;
				if (diff > 0) {
					Log.log(game, game.workflow.currentPlayer, Log.A.ls_low_eod06, [i, diff]);
					game.unrest(i, diff);
				}
			} else {
				var comp = R.sideForProvince(i) == R.WEST ? maxLsInWest : maxLsInEast;
				var val = game.provinces[i-50].ls;
				var diff = comp - val - 1;
				if (diff > 0) {
					Log.log(game, game.workflow.currentPlayer, Log.A.ls_low_eod06, [i, diff]);
					game.unrest(i, diff);
				}
			}
		}

	},

	canSendLsToWestBerlin: function(game, province) {
		if (province === R.NORDRHEIN_WESTFALEN || province === R.RHEINLAND_PFALZ || province === R.BADEN_WURTTEMBERG) {
			if (game.lsForProvince(province) > game.lsForProvince(R.WEST_BERLIN)) {
				var district = -1; var o1; var o2;
				switch (province) {
					case R.NORDRHEIN_WESTFALEN: district = 1; o1 = 0; o2 = 2; break;
					case R.RHEINLAND_PFALZ: district = 0; o1 = 1; o2 = 2; break;
					case R.BADEN_WURTTEMBERG: district = 2; o1 = 0; o2 = 1; break;
				}
				if (district == -1) return false;

				if (game.provinces[R.WEST_BERLIN-50].ls == undefined || game.provinces[R.WEST_BERLIN-50].ls.length == undefined) return true;
				else {
					if (game.provinces[R.WEST_BERLIN-50].ls[district] - game.provinces[R.WEST_BERLIN-50].ls[o1] < 1 && game.provinces[R.WEST_BERLIN-50].ls[district] - game.provinces[R.WEST_BERLIN-50].ls[o2] < 1) {
						return true;
					}
				} 

			}
		}
		return false;
	},

	shallUseSocialists: function(game) {

		if (game.workflow.phase != R.ACTION_PHASE) return false;

		var mp = this.massProtestMakers(game);
		for (var i = 0 ; i < mp.length ; i++) {
			var r = 50+i;
			if (R.sideForProvince(r) == R.EAST && mp[i] > 0 && game.socialists != undefined && game.socialists > 0) {
				return true;
			}
		}
		return false;

	},

	useSocialists: function(game) {

		var regions = this.possibleProvincesForAddSocialists(game);
		var need = 0;
		_.each(regions, function(region) {
			need += (game.provinces[region-50].unrest - 3);
		});

		if (need <= game.socialists) {
			_.each(regions, function(region) {
				var n = (game.provinces[region-50].unrest - 3);
				game.unrest(region, n*-1);
				game.socialistsAction(region, n);
				game.socialistsBox(n*-1);
				Log.log(game, R.EAST, Log.A.addSocialist, [region, n]);
			});
			return 0;
		}

		return need;
	},

	possibleProvincesForAddSocialists: function(game) {

		var mp = this.massProtestMakers(game);
		var regions = [];
		for (var i = 0 ; i < mp.length ; i++) {
			var r = 50+i;
			if (R.sideForProvince(r) == R.EAST && mp[i] > 0 && game.socialists != undefined && game.socialists > 0) {
				regions.push(r);
			}
		}

		return regions;
	},

	possibleProvincesForRemoveSocialists: function(game) {
		var res = [];

		for (var i = R.MECKLENBURG_VORPOMMERN ; i <= R.THURINGEN ; i++) {
			if (game.provinces[i-50].socialists != undefined && game.provinces[i-50].socialists > 0) {
				res.push(i);
			}
		}

		return res;
	},

	iconsForAction: function(game, action, param) {
		var icons = [];

		if (action == 1) {
			if (game.workflow.currentPlayer == R.WEST) {
				icons.push(R.REMOVE_UNREST_W);
				if (R.cards[param].color != game.workflow.currentPlayer) {
					icons.push(R.DISBAND_W);
				}
			} else if (game.workflow.currentPlayer == R.EAST) {
				icons.push(R.REMOVE_UNREST_E);
				if (R.cards[param].color != game.workflow.currentPlayer) {
					icons.push(R.DISBAND_E);
				}
			}
		} else if (action == 2) {
			if (game.workflow.currentPlayer == R.WEST) {
				for (var i = 0 ; i < param ; i++) {
					icons.push(R.BUILD_W);
				}
			} else if (game.workflow.currentPlayer == R.EAST) {
				for (var i = 0 ; i < param ; i++) {
					icons.push(R.BUILD_E);
				}
			}
		}  else if (action == 3) {
			for (var i = 0 ; i < 3 ; i++) {
				icons.push(R.PUT_LS);
			}
		}

		return icons;
	},

	giveLinesBonuses: function(game, card, removed) {
		if (R.cards[card].arrows == undefined) return [0,0,0];

		var lines = game.lines.concat([]);
		var modifier = R.cards[card].arrows.concat([]);

		if (removed != undefined && length == 2) {
			lines[removed[0]] -= removed[1];
		}

		var depassement = [0,0,0];
		if (lines == undefined || lines.length != 3) lines = [0,0,0];
		if (modifier != undefined && modifier.length == 3) {
			for (var i = 0 ; i < 3 ; i++) {
				var movement = Math.abs(lines[i] + modifier[i]);
				if (movement > 6) {
					depassement[i] = movement - 6;
					if (modifier[i] < 0) {
						depassement[i] *= -1;
					}
				}
			}
		}

		return depassement;
	},

	giveIconListForBonus: function(bonus) {
		var res = [];
		
		if (bonus != undefined && bonus.length == 3) {
			if (bonus[0] != 0) {
				if (bonus[0] < 0) {
					for (var i = 0 ; i > bonus[0] ; i--) {
						res.push({symbol: R.BONUS_PRESTIGE_W, player: R.WEST});
					}
				} else if (bonus[0] > 0) {
					for (var i = 0 ; i < bonus[0] ; i++) {
						res.push({symbol: R.BONUS_PRESTIGE_E, player: R.EAST});
					}
				}
			}
			if (bonus[1] != 0) {
				if (bonus[1] < 0) {
					for (var i = 0 ; i > bonus[1] ; i--) {
						res.push({symbol: R.BONUS_WC_W, player: R.WEST});
					}
				} else if (bonus[1] > 0) {
					for (var i = 0 ; i < bonus[1] ; i++) {
						res.push({symbol: R.BONUS_WC_E, player: R.EAST});
					}
				}
			}
			if (bonus[2] != 0) {
				if (bonus[2] < 0) {
					for (var i = 0 ; i > bonus[2] ; i--) {
						res.push({symbol: R.BONUS_SOCIALIST_W, player: R.WEST});
					}
				} else if (bonus[2] > 0) {
					for (var i = 0 ; i < bonus[2] ; i++) {
						res.push({symbol: R.BONUS_SOCIALIST_E, player: R.EAST});
					}
				}
			}
		}
		
		return res;
	}
}