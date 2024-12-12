var Controller = {
	/**
	 * Initialisation du controller
	 * @param game : la partie en cours
	 * @param pov : le point de vue de ce controller (optionnel)
	 */
	init: function(game, pov) {

		this.game = game;
		if (pov == undefined) this.pov = 0;
		else this.pov = pov;
		this.view = new View(game, pov);

		// afficher l'écran
		this.view.display();

		// si le jeu n'est pas fini
		// et si c'est au joueur courant
		// appeler la méthode de démarrage du controller
		if (this.game.win == undefined) {

			if (this.game.workflow.currentPlayer === R.WEST) {
				if (this.game.players[0].hamburg != undefined) {
					R.setHamburgTo(this.game.players[0].hamburg);
				}
			}

			if (this.game.workflow.currentPlayer === this.pov || (this.game.workflow.phase == R.CHANGE_HAND && this.pov > 0)) {
				this.start();
				this.startTriggers();
				this.sayBeep();
			}
		}

		// lancer les on() commons de la vue
		this.view.startTriggers();

	},

	startTriggers: function() {
		if (this.game.workflow.currentPlayer == R.EAST && this.pov == R.EAST && this.game.win == undefined && this.game.workflow.phase == R.ACTION_PHASE) {
			$('.police.activeable').off().on('click', {controller:this}, this.activatePolice);
		} else {
			$('.police.activeable').off();
		}
		if (this.game.workflow.currentPlayer == R.WEST) $("#hamburgButton").off().on('click', {c:this}, this.switchHamburg);
	},

	sayBeep: function() {
		if (this.beep == undefined) {
			this.beep = new Audio('mp3/beep.mp3');
		}
		if (this.pov === this.game.workflow.currentPlayer) this.beep.play();
	},

	/**
	 * Fonction principale permettant de calculer ou afficher ce qu'il faut.
	 */
	start: function() {

		delete this.context;

		if (this.game.workflow.currentPlayer === this.pov || (this.game.workflow.phase == R.CHANGE_HAND && this.pov > 0)) {

			if (this.game.workflow.phase == undefined) {
				this.game.deleteContext();
				this.game.workflow.phase = R.ACTION_PHASE;
				if (this.game.workflow.currentPlayer == undefined) this.game.workflow.currentPlayer = R.WEST;
			}

			if (this.game.context == undefined) {
				switch (this.game.workflow.phase) {
					case R.ACTION_PHASE:
						this.prepareChooseCard();
						break;
					case R.CHANGE_HAND:
						if (this.game.players[this.pov-1].ok !== true) {
							this.prepareSelectCardsToDiscard();
						}
						break;
					case R.END_OF_DECADE:
						if (this.game.workflow.currentPlayer == this.pov) {
							this.processEndOfDecade();
						}
						break;
				}
			} else {
				this.context = this.game.loadContext();
				if (this.context.interruption == R.INTERRUPTION_ICON) {
					if (this.game.workflow.phase == R.ACTION_PHASE) this.view.displayCurrentAction(this.context);
					this.prepareEvent();
				} else if (this.context.interruption == R.INTERRUPTION_REPRISE) {
					this.game.deleteContext();
					delete this.context.interruption;
					this.view.displayCurrentAction(this.context);
					this.prepareEvent();
				} else if (this.context.interruption == R.INTERRUPTION_SOCIALISTS) {
					this.prepareEvent();
				} else if (this.game.workflow.phase == R.END_OF_DECADE) {
					if (this.game.workflow.subphase == 2) this.processEndOfDecade();
					else this.prepareEvent();
				} else if (this.context.guillaumeType != undefined) {
					this.view.displayCurrentAction(this.context);
					this.chooseGuillaumeTypeInner(this.context.guillaumeType);
				} else {
					this.view.displayCurrentAction(this.context);
					this.prepareEvent();
				}
			}
		}
	},

	switchHamburg: function(event) {
		var province = $(event.currentTarget).data('to');
		R.setHamburgTo(province);
		event.data.c.game.players[0].hamburg = province;
		$("#hamburgSelection").remove();
		$("#west").append(event.data.c.view.giveHamburgButton());
		$("#hamburgButton").off().on('click', {c:event.data.c}, event.data.c.switchHamburg);
	},

	prepareChooseCard: function() {
		this.view.showAvailableCards();
		$(".selectable:not(.not)").on('click', {controller:this}, this.chooseCard);
		this.view.setInstruction("Select a card to perform an action");
	},

	chooseCard: function(event) {
		var c = event.data.controller;
		var g = c.game;
		var v = c.view;

		c.context = {
			rank: parseInt($(this).data('index')),
			card: parseInt($(this).data('card')),
			hand: $(this).hasClass('hand')
		};

		var displayEvent = true;
		if (g.workflow.currentPlayer == R.EAST && R.cards[c.context.card].color == R.WEST || g.workflow.currentPlayer == R.WEST && R.cards[c.context.card].color == R.EAST) displayEvent = false;

        var displayUnrest = true;
		if ( (g.workflow.currentPlayer == R.EAST && R.cards[c.context.card].color != R.EAST || g.workflow.currentPlayer == R.WEST && R.cards[c.context.card].color != R.WEST) && Rules.nbDismantleForEast(g) == 0 ) {
			displayUnrest = false;
		}

		$(".card.selectable").removeClass('selectable');
		v.hidePopinCardDetail();
		v.showAvailableActions(displayEvent, displayUnrest);
		v.highlightCard(event.currentTarget);
		v.allowActions();

		c.addResetValidateButtons();
		$(".selectable").off('click');

		if (c.context.card > 80) {
			c.context.action = 4;
			Log.log(g, g.workflow.currentPlayer, Log.A.choose_card, [c.context.card, 4, c.context.hand === true]);
			
			if (global.creationdate != undefined && global.creationdate < NEWRULES_TS) {
				c.prepareActionExecution();
			} else {
				c.askDrawbackForSpecialCard();
			}
		} else {
			$(".doable .actionButton").on('click', {view:v,game:g,controller:c}, c.chooseAction);
		}
	},

	addResetValidateButtons: function(reset, validate, keepInstruction) {
		if (validate === true && keepInstruction !== true) this.view.setInstruction('');
		this.view.addResetValidateButtons(reset, validate);
		$(".resetvalidate").on('click', {controller: this}, this.resetValidate);
	},

	resetValidate: function(event) {
		var type = parseInt($(event.currentTarget).data('type'));

		$(".selector").remove();
		$(".proposal").remove();

		if (type == 1) {
			event.data.controller.next();
		} else {
			reset();
		}
	},

    askDrawbackForSpecialCard: function() {
        this.view.askDrawbackForSpecialCard();
        $('.drawbackbutton').on('click', {controller: this}, this.chooseDrawback);
    },

    chooseDrawback: function(e) {
        var c = e.data.controller;
        var drawback = $(e.currentTarget).data('btn');

        switch (drawback) {
            case 0:
                reset();
                break;
            case 1:
                c.selectDrawbackCardToDiscard();
                break;
            case 2:
			    if (c.game.players[0].hand == undefined) {
			        c.game.players[0].hand = [];
			    }
			    c.game.players[0].hand.push(c.game.currentDeck.shift());
			    c.view.refreshPlayers();

                c.prepareActionExecution();
                break;

        }
    },

    selectDrawbackCardToDiscard: function() {
        this.view.discardDrawbackCard();

		$(".discardLine .card").on('click', {controller:this}, this.chooseDrawbackCard);
    },

    chooseDrawbackCard: function(e) {
        var c = e.data.controller;
        var carte = $(e.currentTarget).data('index');

        c.game.players[1].hand.splice(carte, 1);
        c.view.refreshPlayers();

        c.prepareActionExecution();
    },

	chooseAction: function(event) {
		var g = event.data.game;
		var v = event.data.view;
		var c = event.data.controller;

		var action = parseInt($(event.currentTarget).data('type'));
		c.context.action = action;
		Log.log(g, g.workflow.currentPlayer, Log.A.choose_card, [c.context.card, action, c.context.hand === true]);

		if (action == 4 && c.context.card == 50) {
			if (confirm("Warning ! Playing the Guillaum affair is not cancelable. Are you sure ?")) {
				c.saveGuillaume = true;
				c.prepareActionExecution();
			} else {
				reset();
			}
		} else if (action == 4 && c.context.card == 63) {
			R.setHamburgTo(R.NIEDERSACHSEN);
			c.prepareActionExecution();
		} else {
			c.prepareActionExecution();
		}
	},

	prepareActionExecution: function() {
		$("#actiondetail").empty();
		this.view.displayCurrentAction(this.context);
		this.view.startTriggers();

		var options = {linear: true};
		switch (this.context.action) {
			case 1:
				this.context.iconList = Rules.iconsForAction(this.game, this.context.action, this.context.card);
				break;
			case 2:
				var buildpoints = R.giveCardValueForSide(this.context.card, this.game.workflow.currentPlayer);
				this.context.iconList = Rules.iconsForAction(this.game, this.context.action, buildpoints);
				break;
			case 3:
				if (this.game.workflow.currentPlayer == R.EAST && (this.pov == R.DUAL || this.pov == R.EAST) && Rules.ambiguousExternalFactories(this.game, this.pov).length > 0) {
					var ext = Rules.ambiguousExternalFactories(this.game, this.pov);
					this.context.external = ext.length;
					this.prepareAskExternalFactories(ext);
				} else {
					var buildpoints = R.giveCardValueForSide(this.context.card, this.game.workflow.currentPlayer);
					this.context.buildpoints = buildpoints;
					this.context.iconList = Rules.iconsForAction(this.game, this.context.action, buildpoints);
					// TODO permettre d'annuler en cas de pas de LS possible
				}
				break;
			case 4:
				if ( R.cards[this.context.card].icons != undefined) this.context.iconList = R.cards[this.context.card].icons.concat([]);
				else this.context.iconList = [];
				var bonus = Rules.giveLinesBonuses(this.game, this.context.card, this.context.removed);
				if (bonus != undefined && bonus.length == 3 && (bonus[0] != 0 || bonus[1] != 0 || bonus[2] != 0)) {
					this.context.iconList = this.context.iconList.concat(Rules.giveIconListForBonus(bonus));
				}
				options.linear = false;
				if (this.saveGuillaume == true) {
					delete this.saveGuillaume;
					this.game.saveContext(this.context);
					IO.saveGameData(this.game);
				}
				break;
		}

		if (this.context.card == 82) {
			this.game.wall = true;
			this.view.drawWall();
			Log.log(this.game, this.game.workflow.currentPlayer, Log.A.buildwall);
			this.addResetValidateButtons(true, true);
		} else if (this.context.external == undefined) {
			this.prepareEvent(options);
		}
	},

	prepareEvent: function(options) {

		var icons = [];
		if (options == undefined) options = {};
		if (options.iconList != undefined) icons = options.iconList;
		else if (this.context.iconList != undefined) icons = this.context.iconList;

		var rankUnavailable = [];
		if (options.icons != undefined) rankUnavailable = options.icons;
		else if (this.context.icons != undefined) rankUnavailable = this.context.icons;

		// affichage
		if (this.context.action === 4) {
			if (rankUnavailable.length >= icons.length) {
				this.executeArrows();
			} else {
				var pRes;
				if (this.context.interruption === R.INTERRUPTION_ICON) {
					pRes = this.game.workflow.currentPlayer;
				}

				if (this.game.workflow.phase == R.ACTION_PHASE) this.view.displayCardDetail(this.context.card, this.context.icons, pRes, this.context.iconList, this.context.removed);

				if (R.cards[this.context.card].color == R.DUAL && this.context.removed == undefined && this.context.interruption == undefined) {
					this.view.prepareRemoveIcons();
					$('span.icon:not(.informative) img').on('click', {controller: this}, this.removeSymbol);	
					$(".skip_remove_icon").on('click', {controller: this}, this.skipRemoveSymbol);
				} else {
					$('span.icon:not(.informative) img').on('click', {controller: this}, this.chooseIcon);	
				}

			}
		} else {
			$("#actiondetail").empty();
			if (rankUnavailable.length >= icons.length) {
				this.addResetValidateButtons(true, true);
			} else if (icons[0] != undefined && icons[0].symbol != undefined && icons[0].symbol == R.END_OF_GAME) {
				this.game.endGame(icons[0].cause);
				IO.saveGameData(this.game);
				var victor = this.game.players[0].name;
				if (icons[0].cause == R.TRIUMPH_OF_SOCIALISM || icons[0].cause == R.WEST_COLLAPSE  || icons[0].cause == R.DOUBLE_COLLAPSE  || icons[0].cause == R.FULL_GAME) victor = this.game.players[1].name;
				IO.victory(this.game, icons[0].cause, victor);
				this.view.display();
				this.startTriggers();
			} else {
				var linear = true;
				if (this.game.workflow.phase == R.END_OF_DECADE && this.game.workflow.subphase == 2) linear = false;
				this.view.displayIcons(icons, linear, rankUnavailable);

				if (linear === true) {
					if (this.context.icon_rank == undefined) this.context.icon_rank = 0;
					this.prepareExecuteIcon();
				} else {
					$('span.icon:not(.informative) img').on('click', {controller: this}, this.chooseIcon);
				}
				if (this.context.action == 3) {
					var bonus = Math.min(2,this.context.buildpoints);
					var p = Rules.possibleProvincesForLs(this.game, bonus, this.context != undefined ? this.context.spots : undefined);
					if (p != undefined && p.length > 0) {
						this.addResetValidateButtons(true, true, true);
						$("#actiondetail").append("<p>" + this.context.buildpoints + " bonus point(s) remaining</p>");
					} else {
						this.addResetValidateButtons(true, true);
						$("#actiondetail").append("<p>No valid target</p>");
					}
				} else if (this.game.workflow.currentPlayer == this.pov && $(".resetvalidateline").length == 0) {
					this.addResetValidateButtons();
				}
			}
		}
	},

	skipRemoveSymbol: function(event) {
		var c = event.data.controller;
		c.context.removed = [];
		c.view.afterRemoveIcons();
		c.prepareEvent();
	},

	removeSymbol: function(event) {
		var c = event.data.controller;
		var self = $(event.currentTarget).parent();
		var rank; var line; var mod;
		var arrows;
		if (self.hasClass('arrow')) {
			line = self.data('line');
			mod = self.data('mod');
			c.removeBonusSymbol(line, mod);
		} else {
			rank = self.data('rank');
		}
		self.addClass('removed');

		c.view.afterRemoveIcons();

		if (rank != undefined) {
			if (c.context.icons == undefined) c.context.icons = [];
			c.context.icons.push(rank);
			c.context.removed = rank;
			Log.log(c.game, c.game.workflow.currentPlayer, Log.A.removed_icon, [c.context.iconList[rank]]);
			c.prepareEvent();
		} else {
			c.context.removed = [line,mod];
			Log.log(c.game, c.game.workflow.currentPlayer, Log.A.removed_icon, [line,mod]);
			c.prepareEvent();
		}

	},

	removeBonusSymbol: function(line, mod) {
		if (this.context != null && this.context.iconList != null) {
			var toRemove = -1;
			for (var i = 0 ; i < this.context.iconList.length ; i++) {
				var icon = this.context.iconList[i];
				if (isNaN(icon) && icon.symbol != undefined) {
					if ((line == 0 && mod > 0 && icon.symbol == R.BONUS_PRESTIGE_E) ||
						(line == 0 && mod < 0 && icon.symbol == R.BONUS_PRESTIGE_W) ||
						(line == 1 && mod > 0 && icon.symbol == R.BONUS_WC_E) ||
						(line == 1 && mod < 0 && icon.symbol == R.BONUS_WC_W) ||
						(line == 2 && mod > 0 && icon.symbol == R.BONUS_SOCIALIST_E) ||
						(line == 2 && mod < 0 && icon.symbol == R.BONUS_SOCIALIST_W)) {
						toRemove = i;
						break;
					}
				}
			}
			if (toRemove > -1) {
				if (this.context.icons == undefined) this.context.icons = [];
				this.context.icons.push(i);
				$($("#actiondetail .icon")[toRemove]).addClass("informative passed").children("img").off();
			}
		}
	},

	chooseIcon: function(event) {
		var c = event.data.controller;

		var rank = parseInt($(event.currentTarget).parent().data('rank'));
		c.context.icon_rank = rank;

		$(".icon.active").removeClass('active');
		$(event.currentTarget).parent().addClass('active');

		c.prepareExecuteIcon();
	},

	chooseBonusIcon: function(event) {
		var c = event.data.controller;

		var rank = parseInt($(event.currentTarget).data('rank'));

		var effect = c.context.iconList[c.context.icon_rank].symbol;
		if (effect == R.BONUS_PRESTIGE_E) {
			Log.log(c.game, R.EAST, Log.A.choose_prestige);
			if (rank == 0) {
				c.context.iconList[c.context.icon_rank] = R.REMOVE_UNREST_E;
			} else if (rank == 1) {
				c.context.iconList[c.context.icon_rank] = R.PLACE_UNREST_W;
			}
		} else if (effect == R.BONUS_PRESTIGE_W) {
			Log.log(c.game, R.WEST, Log.A.choose_prestige);
			if (rank == 0) {
				c.context.iconList[c.context.icon_rank] = R.REMOVE_UNREST_W;
			} else if (rank == 1) {
				c.context.iconList[c.context.icon_rank] = R.PLACE_UNREST_E;
			}
		}

		$(".icon.active").removeClass('active');
		$(event.currentTarget).parent().addClass('active');

		c.prepareExecuteIcon();
	},

	prepareExecuteIcon: function() {
		$(".selector_top").remove();
		if (this.context.icon_rank != undefined) {
			var icon = this.context.iconList[this.context.icon_rank];
			var val; var restriction; var max; var player;
			if (!isNaN(icon)) val = icon;
			else {
				val = icon.symbol;
				restriction = icon.restriction;
				max = icon.max;
				player = icon.player;
			}

			if (this.context.action == 3) {
				max = this.context.buildpoints;
			}

			if (player != undefined && (player != this.game.workflow.currentPlayer || this.pov != this.game.workflow.currentPlayer)) {
				this.game.workflow.currentPlayer = player;
				this.context.interruption = R.INTERRUPTION_ICON;
				this.game.saveContext(this.context);
				this.addResetValidateButtons(true, true);
			} else {
				if (val == R.GUILLAUME_AFFAIR) {
					this.prepareGuillaumeAffair();
				} else {
					this.prepareExecuteEffect(val, restriction, max);
				}
			}
		}
	},

	prepareExecuteEffect: function(effect, restriction, max) {

		// max utile seulement pour PLACE_UNREST et PUT_LS_W
		// max sert également à indiquer le bonus dispo pour le put LS standard

		var p = {}
		switch (effect) {
			case R.PLACE_UNREST_W:
				p.provinces = Rules.possibleSpotsForUnrest(this.game, restriction, max, this.context.spots, R.WEST);
				break;
			case R.BONUS_WC_W:
			case R.BONUS_SOCIALIST_W:
			case R.PLACE_UNREST_E:
				p.provinces = Rules.possibleSpotsForUnrest(this.game, restriction, max, this.context.spots, R.EAST);
				break;
			case R.REMOVE_UNREST_W:
				p.provinces = Rules.possibleSpotsForRemoveUnrest(this.game, restriction, R.WEST);
				break;
			case R.BONUS_WC_E:
			case R.BONUS_SOCIALIST_E:
			case R.REMOVE_UNREST_E:
				p.provinces = Rules.possibleSpotsForRemoveUnrest(this.game, restriction, R.EAST);
				break;
			case R.MOVE_UNREST_E:
				p.provinces = Rules.possibleProvincesForUnrestMovement(this.game, R.EAST);
				break;
			case R.BUILD_W:
				p =  Rules.possibleSpotsForBuild(this.game, R.WEST);
				break;
			case R.BUILD_E:
				p =  Rules.possibleSpotsForBuild(this.game, R.EAST, restriction);
				break;
			case R.DISBAND_W:
				p =  Rules.possibleSpotsForDismantle(this.game, R.WEST, restriction);
				break;
			case R.DISBAND_E:
				p =  Rules.possibleSpotsForDismantle(this.game, R.EAST);
				break;
			case R.REMOVE_MASS_PROTEST:
				p.provinces = Rules.possibleSpotsForRemoveMassProtest(this.game, R.EAST);
				break;
			case R.PUT_LS_W:
				p.provinces = Rules.possibleProvincesForFreeLs(this.game, restriction, this.context.spots, R.WEST);
				break;
			case R.PUT_LS_LIMITED_W:
				p.provinces = Rules.possibleProvincesForFreeLs(this.game, restriction, [], R.WEST);
				break;
			case R.PUT_LS:
				var bonus = Math.min(2,this.context.buildpoints);
				p.provinces = Rules.possibleProvincesForLs(this.game, bonus, this.context != undefined ? this.context.spots : undefined);
				break;
			case R.REMOVE_LS_E:
				p.provinces = Rules.possibleProvincesForRemoveLs(this.game, R.EAST);
				break;
			case R.REMOVE_LS_W:
				p.provinces = restriction;
				break;
			case R.STOP_FACTORY_E:
				p.factories = Rules.possibleSpotsForStopFactories(this.game, R.EAST, restriction);
				break;
			case R.RUNDOWN_FACTORY_E:
				p.factories = Rules.possibleSpotsForRundown(this.game);
				break;
			case R.REPAIR_FACTORY_E:
				p.factories = Rules.possibleSpotsForRepair(this.game, restriction);
				break;
			case R.RED_POLICE:
				if (this.game.players[R.EAST-1].stasi !== true) { 
					this.game.addPoliceToEast(1);
					this.view.refreshPlayers();
					this.startTriggers();
				}
				break;
			case R.PINK_POLICE:
				if (this.game.players[R.EAST-1].stasi !== true) {
					this.game.addPoliceToEast(1, true);
					this.view.refreshPlayers();
					this.startTriggers();
				}
				break;
			case R.REMOVE_BERLIN_WALL:
				this.game.wall = false;
				Log.log(this.game, this.game.workflow.currentPlayer, Log.A.removewall);
				this.view.drawWall();
				break;
			case R.STASI_DISBANDMENT:
				if (this.game.players[1].police != undefined) {
					if (this.game.players[1].police[2] > 0) {
						for (var i = 0 ; i < this.game.players[1].police[2] ; i++) {
							var ic = {symbol: R.PLACE_UNREST_E, player: R.EAST, max: 1}
							this.context.iconList.push(ic);
						}
					}
					delete this.game.players[1].police;
					this.view.refreshPlayers();
				}
				this.game.players[1].stasi = true;
				Log.log(this.game, this.game.workflow.currentPlayer, Log.A.stasi_disbandment);
				break;
			case R.PUT_LS_E:
				p.provinces = Rules.possibleProvincesForFreeLs(this.game, restriction, undefined, R.EAST);
				break;
			case R.ADD_SOCIALISTS:
				p.provinces = Rules.possibleProvincesForAddSocialists(this.game);
				break;
			case R.REMOVE_SOCIALISTS:
				p.provinces = Rules.possibleProvincesForRemoveSocialists(this.game);
				break;
			case R.ADD_SUPPLIER_MP:
				p.provinces = [R.NORDRHEIN_WESTFALEN, R.RHEINLAND_PFALZ, R.BADEN_WURTTEMBERG];
				break;
			case R.SET_HAMBURG:
				p.provinces = [R.SCHLESWIG_HOLSTEIN, R.NIEDERSACHSEN];
				break;
		}

		if (effect == R.BONUS_PRESTIGE_E || effect == R.BONUS_PRESTIGE_W) {
			this.preparePrestigeBonus(effect);
		} else if ((p.provinces != undefined && p.provinces.length > 0) ||
			(p.factories != undefined && p.factories.length > 0) ||
			(p.roads != undefined && p.roads.length > 0)) {
			this.propose(p);
		} else if (effect == R.DISBAND_E && (p.provinces == undefined || p.provinces.length == 0) && this.game.workflow.phase == R.END_OF_DECADE) {
			this.game.endGame(R.NATIONAL_INSOLVENCY);
			IO.saveGameData(this.game);
			IO.victory(this.game, R.NATIONAL_INSOLVENCY, this.game.players[0].name);
			this.view.display();
			this.startTriggers();
		} else {
			this.endAction();
		}
	},

	preparePrestigeBonus: function(effect) {
		var lines = []
		if (effect == R.BONUS_PRESTIGE_E) {
			lines = [[R.REMOVE_UNREST_E],[R.PLACE_UNREST_W]];
		} else if (effect == R.BONUS_PRESTIGE_W) {
			lines = [[R.REMOVE_UNREST_W],[R.PLACE_UNREST_E]];
		}

		if (lines.length > 0) {
			this.view.displayActionLines(lines);
			$("#actiondetail").append('<p> Choose a prestige advantage </p>');
			$(".icon_line").on('click', {controller: this}, this.chooseBonusIcon);
		}
	},

	propose: function(proposal) {
		if (proposal != undefined) {
			$(".selector").remove();
			$(".proposal").remove();

			if (proposal.provinces != undefined) {
				this.view.showSelectProvinces(proposal.provinces);
				$(".selector").on('click', {controller:this}, this.selectProvince);
			} else {
				if (proposal.roads != undefined) {
					if (this.game.roads != undefined) {
						var oldroads = [];
						var newroads = [];
						_.each(proposal.roads, function(road) {
							if (this.game.roadExists(road)) oldroads.push(road);
							else newroads.push(road);
						}, this);
						proposal.roads = oldroads;
						proposal.newRoads = newroads;
					} else {
						proposal.newRoads = proposal.roads.concat([]);
						delete proposal.roads;
					}
				}
				if (proposal.factories != undefined) {
					if (this.game.factories != undefined) {
						var oldfactories = [];
						var newfactories = [];
						_.each(proposal.factories, function(factory) {
							if (this.game.factories.indexOf(factory) > -1) oldfactories.push(factory);
							else newfactories.push(factory);
						}, this);
						proposal.factories = oldfactories;
						proposal.newFactories = newfactories;
					} else {
						proposal.newFactories = proposal.factories.concat([]);
						delete proposal.factories;
					}
				}

				if (proposal.roads != undefined) {
					this.view.proposeRoads(proposal.roads);
				}
				if (proposal.newRoads != undefined) {
					_.each(proposal.newRoads, function(road) {this.view.drawRoad(road, true, true)}, this);
				}
				if (proposal.factories != undefined) {
					this.view.proposeFactories(proposal.factories);
				}
				if (proposal.newFactories != undefined) {
					_.each(proposal.newFactories, function(factory) {this.view.drawFactory(factory, undefined, undefined, true, true)}, this);
				}
				$(".proposal").on('click', {controller:this}, this.selectBuildPoint);
			}
		}
	},

	selectProvince: function(event) {
		var c = event.data.controller;
		var province = parseInt($(event.currentTarget).data('province'));
		c.context.target = province;
		$(".selector_top").remove();

		c.executeIcon();

	},

	selectBuildPoint: function(event) {
		var c = event.data.controller;
		var index = $(event.currentTarget).data('index');
		var factory = $(event.currentTarget).hasClass('factory');
		c.context.target = index;
		c.context.isFactory = factory;

		c.executeIcon();
	},

	executeIcon: function() {
		$(".selector").remove();
		$(".proposal").remove();

		if (this.context != undefined) {
			var effect;
			if (this.game.workflow.phase == R.POLICE_ACTIVATION) {
				effect = R.REMOVE_UNREST_E;
			} else if (this.context.moveunrest === true) {
				effect = R.PLACE_UNREST_E;
				delete this.context.moveunrest;
			} else {
				effect = this.context.iconList[this.context.icon_rank];
				if (isNaN(effect)) effect = effect.symbol;
			}

			var factory = false;
			if (this.context.isFactory === true) factory = true;
			var target = this.context.target;
			var sector = -1;

			switch (effect) {
				// build points
				case R.BUILD_W:
				case R.BUILD_E:
					if (factory) {
						this.game.buildFactory(target);
						Log.log(this.game, this.game.workflow.currentPlayer, Log.A.build, [0, target]);
					} else {
						this.game.buildRoad(target);
						Log.log(this.game, this.game.workflow.currentPlayer, Log.A.build, [1, target]);
					}
					break;
				case R.DISBAND_W:
				case R.DISBAND_E:
					if (factory) {
						this.game.removeFactory(target);
						Log.log(this.game, this.game.workflow.currentPlayer, Log.A.dismantle, [0, target]);
					} else {
						this.game.removeRoad(target);
						Log.log(this.game, this.game.workflow.currentPlayer, Log.A.dismantle, [1, target]);
					}
					break;
				case R.STOP_FACTORY_E:
					Rules.performStopFactory(this.game, target);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.stop_factory, [target]);
					break;
				case R.RUNDOWN_FACTORY_E:
					this.game.rundownBuilding(target);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.rundown, [target]);
					break;
				case R.REPAIR_FACTORY_E:
					this.game.repairBuilding(target);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.repair, [target]);
					break;

				// provinces
				case R.BONUS_WC_W:
				case R.BONUS_SOCIALIST_W:
				case R.PLACE_UNREST_W:
				case R.PLACE_UNREST_E:
					var init_mp = -1;
					var force = 1;
					var initiateur = undefined;
					if (this.game.workflow.phase == R.END_OF_DECADE && this.game.workflow.subphase == 7 && this.context.currentProvince != undefined) {
						force = this.game.lsForProvince(this.context.currentProvince) - this.game.lsForProvince(target) - this.context.startingMassProtest[this.context.currentProvince-50];
						initiateur = N.provinces[this.context.currentProvince - 50];
					}
					if (target == R.WEST_BERLIN) {
						init_mp = Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN);
					}
					this.game.unrest(target, force);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.unrest, [target, force, initiateur]);
					if (target == R.WEST_BERLIN && Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN) > init_mp) {
						this.context.iconList.push({
							symbol: R.ADD_SUPPLIER_MP,
							player: R.EAST
						});
					}
					break;
				case R.MOVE_UNREST_E:
					this.context.moveunrest = true;
				case R.BONUS_WC_E:
				case R.BONUS_SOCIALIST_E:
				case R.REMOVE_UNREST_W:
				case R.REMOVE_UNREST_E:
					var init_mp = -1;
					if (target == R.WEST_BERLIN) {
						init_mp = Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN);
					}
					this.game.unrest(target, -1);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.remove_unrest, [target, this.game.workflow.phase == R.POLICE_ACTIVATION]);
					if (target == R.WEST_BERLIN && Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN) < init_mp) {
						this.game.removeFirstBerlinSupplierMassProtest();
					}
					break;
				case R.REMOVE_MASS_PROTEST:
					this.game.removeMassProtest(target);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.remove_mass_protest, [target]);
					break;
				case R.PUT_LS:
					var pts = Rules.pointsNeededToBuildLs(this.game)[target-50];
					this.context.buildpoints -= pts;
					var initUnrest = this.game.provinces[target - 50].unrest;
					if (initUnrest == undefined) initUnrest = 0;
					var init_mp = -1;
					if (target == R.WEST_BERLIN) {
						init_mp = Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN);
					}
					this.game.unrest(target, -1);
					if (target == R.WEST_BERLIN && Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN) < init_mp) {
						this.game.removeFirstBerlinSupplierMassProtest();
					}

					this.game.livingStandard(target, 1);
					if (Rules.canSendLsToWestBerlin(this.game, target) && this.context.sentToBerlin != true) {
						if (confirm('Send LS to West Berlin ?')) {
							var district = -1;
							switch (target) {
								case R.NORDRHEIN_WESTFALEN: district = 1; break;
								case R.RHEINLAND_PFALZ: district = 0; break;
								case R.BADEN_WURTTEMBERG: district = 2; break;
							}
							if (district !== -1) {
								this.game.livingStandard(target, -1);
								this.game.livingStandard(R.WEST_BERLIN, 1, false, district);
								this.game.unrest(target, initUnrest, true);
								this.game.unrest(R.WEST_BERLIN, -1, false, district);
								this.context.sentToBerlin = true;
							}
							if (this.game.players[0].toBerlin == undefined) this.game.players[0].toBerlin = [];
							if (this.game.players[0].toBerlin.indexOf(target) == -1) this.game.players[0].toBerlin.push(target);
							Log.log(this.game, this.game.workflow.currentPlayer, Log.A.full_ls, [R.WEST_BERLIN, true]);
							if (this.game.provinces[R.WEST_BERLIN-50].unrest%4 == 3) {
								this.game.removeFirstBerlinSupplierMassProtest();
							}
						}
					} else {
						Log.log(this.game, this.game.workflow.currentPlayer, Log.A.full_ls, [target, true]);
					}

					if (this.context.icon_rank < 2 && Rules.possibleProvincesForLs(this.game,Math.min(2,this.context.buildpoints),this.context.spots).length == 0) {
						this.context.icons = [0,1,2];
						this.context.icon_rank = 2;
					}

					break;
				case R.PUT_LS_W:
				case R.PUT_LS_E:
					if (target > R.WEST_BERLIN*10) {
						sector = target%10 - 1;
						target = R.WEST_BERLIN;
					}
					var init_mp = -1;
					if (target == R.WEST_BERLIN) {
						init_mp = Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN);
					}
					this.game.unrest(target, -1);
					if (target == R.WEST_BERLIN && Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN) < init_mp) {
						this.game.removeFirstBerlinSupplierMassProtest();
					}
					if (sector == -1) this.game.livingStandard(target, 1);
					else this.game.livingStandard(target, 1, false, sector);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.full_ls, [target, true]);
					break;
				case R.PUT_LS_LIMITED_W:
					if (sector == -1) this.game.livingStandard(target, 1);
					else this.game.livingStandard(target, 1, false, sector);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.ls, [target]);
					break;
				case R.REMOVE_LS_W:
					var district = target%10 - 1;
					target = R.WEST_BERLIN;
					this.game.livingStandard(target, -1, false, district);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.remove_ls, [target]);
					break;
				case R.REMOVE_LS_E:
					this.game.livingStandard(target, -1);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.remove_ls, [target]);
					break;
				case R.ADD_SOCIALISTS:
					this.game.socialistsAction(target, 1);
					this.game.unrest(target, -1);
					this.game.socialistsBox(-1);
					this.view.drawSocialistsBox();
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.addSocialist, [target]);
					break;
				case R.REMOVE_SOCIALISTS:
					this.game.socialistsAction(target, -1);
					this.game.unrest(target, 1);
					this.view.drawSocialistsBox();
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.remove_socialists, [target]);
					break;
				case R.ADD_SUPPLIER_MP:
					var supplier = -1;
					if (target == R.NORDRHEIN_WESTFALEN) supplier = 1;
					if (target == R.RHEINLAND_PFALZ) supplier = 0;
					if (target == R.BADEN_WURTTEMBERG) supplier = 2;

					this.game.berlinSupplierMassProtest(supplier, 1);
					Log.log(this.game, this.game.workflow.currentPlayer, Log.A.add_supplier_mp, [target]);
					break;
				case R.SET_HAMBURG:
					this.game.players[0].hamburg = target;
					R.setHamburgTo(target);
					break;
			}

			this.view.refreshBoard();
			if (this.context.moveunrest !== true) {
				if (this.context.spots == undefined) this.context.spots = [];
				if (effect != R.ADD_SUPPLIER_MP) this.context.spots.push(target);
				delete this.context.target;
				this.endAction();
			} else {
				delete this.context.target;
				this.propose({provinces:Rules.possibleSpotsForUnrest(this.game, undefined, undefined, undefined, R.EAST)});
			}
		}
	},

	endAction: function() {
		if (this.game.workflow.phase == R.POLICE_ACTIVATION) {
			this.game.workflow.phase = this.context.backup_phase;
			this.game.usePolice();
			this.view.refreshPlayers();
			this.startTriggers();
			if (this.context.card != undefined && this.context.action != undefined) this.prepareEvent();
			else this.prepareChooseCard();
		} else {
			if (this.context.icons == undefined) this.context.icons = [];
			this.context.icons.push(this.context.icon_rank);

			if (this.context.interruption == undefined) {
				// TODO autre méthode pour le linear
				if (this.context.action == undefined || this.context.action != 4) this.context.icon_rank++;
				if (this.game.workflow.phase == R.END_OF_DECADE && this.game.workflow.subphase == 7) {
					this.context.currentProvince++;
					this.continueEndOfDecade();
				} else {
					if (this.cleanGuillaume == true) {
						delete this.cleanGuillaume;
						delete this.context.guillaumeType;
						this.game.saveContext(this.context);
						IO.saveGameData(this.game);
					} else {
						if (this.context.card === 27 && this.context.action === 4) {
							this.context.icon_rank++;
							this.context.icons.push(this.context.icon_rank);
						}
						this.prepareEvent();
					}
				}
			} else {
				if (this.context.interruption == R.INTERRUPTION_ICON) {
					var goon = this.game.workflow.phase != R.END_OF_DECADE;
					for (var i = 0; i < this.context.iconList.length; i++) {
						var icon = this.context.iconList[i];
						if (isNaN(icon) && icon.player != undefined && icon.player == this.game.workflow.currentPlayer && this.context.icons.indexOf(i) == -1) {
							goon = false;
						}
					}
					if (goon === true) {
						this.addResetValidateButtons(true, true);
					} else {
						if (this.context.action == undefined || this.context.action != 4) this.context.icon_rank++;
						this.prepareEvent();
					}
				} else if (this.context.interruption == R.INTERRUPTION_SOCIALISTS) {
					if (this.context.action == undefined || this.context.action != 4) this.context.icon_rank++;
					this.prepareEvent();
				}
			}
		}
	},

	processSocialists: function() {
		var go = true;
		if (!(this.game.workflow.phase == R.END_OF_DECADE && this.game.workflow.subphase == 9) && Rules.shallUseSocialists(this.game) === true) {
			var need = Rules.useSocialists(this.game);
			if (need > 0) {
				this.context.previousCurrentPlayer = this.game.workflow.currentPlayer;
				this.context.iconList = [];
				delete this.context.icon_rank;
				delete this.context.icons;
				delete this.context.action;
				delete this.context.spots;
				for (var i = 0 ; i < this.game.socialists ; i++) {
					this.context.iconList.push(R.ADD_SOCIALISTS);
				}
				if (this.game.workflow.currentPlayer == R.EAST && this.pov == R.EAST) {
					this.prepareEvent();
				} else {
					this.game.workflow.currentPlayer = R.EAST;
					this.view.workflow();
					this.context.interruption = R.INTERRUPTION_SOCIALISTS;
					this.game.saveContext(this.context);
				}

				go = false;
			}
			this.view.drawSocialistsBox();
			this.view.refreshBoard();
		}
		return go;
	},

	next: function() {
		$("#actiondetail").empty();
		if (this.game.workflow.phase == R.ACTION_PHASE) {
			var go = true;

			if (this.context.interruption == undefined) {
				if (this.context.action == 4 && this.context.card == 50) {
					$("#guillaumeaffairehelp").hide();
					this.game.deleteContext();
				}
				go = this.processSocialists();
			} else if (this.context.interruption == R.INTERRUPTION_SOCIALISTS) {
				this.game.workflow.currentPlayer = this.context.previousCurrentPlayer;
				delete this.context.interruption;
				this.game.deleteContext();
			}
			this.nextTurn();
		} else if (this.game.workflow.phase == R.END_OF_DECADE) {

			var go = false;
			if (this.context.interruption == undefined) {
				go = true;
				if (this.game.workflow.currentPlayer != this.pov) {
					go = false;
					this.nextTurn();
				} else if (this.context.settingHamburg === true) {
					delete this.context.settingHamburg;
					go = false;
					this.processEndOfDecade();
				} /*else {
					if (this.game.workflow.currentPlayer != this.pov) {
						this.nextTurn();
					}
				}*/
			} else if (this.context.interruption == R.INTERRUPTION_REPRISE) {
				this.game.workflow.currentPlayer = this.context.previousCurrentPlayer;
				delete this.context.interruption;
				this.game.deleteContext();
			} else if (this.context.interruption == R.INTERRUPTION_ICON && this.game.workflow.currentPlayer == this.pov && this.context.icons != undefined && this.context.icons.length >= this.context.iconList.length) {
				this.context.interruption = R.INTERRUPTION_REPRISE;
				this.game.deleteContext();
				go = true;
			}  else if (this.context.interruption == R.INTERRUPTION_SOCIALISTS) {
				delete this.context.interruption;
				this.game.deleteContext();
				go = true;
			} else {
				this.nextTurn();
			}

			if (go === true) {
				switch (this.game.workflow.subphase) {
					case 1:
						if (this.game.wall == true) {
							this.game.modifyLines([-1,0,0]);
							Log.log(this.game, R.EAST, Log.A.arrows, [-1, 0, 0]);
							this.view.lines();
						}
						break;
					case 7:
						$("#attack").empty();
						break;
					case 8:
						if (this.game.players[1].police != undefined) {
							this.game.players[1].police[2] = 0;
						}
						break;
				}

				delete this.context;
				if (this.game.workflow.subphase <= 10) {
					if (this.game.workflow.subphase != 5 || Rules.removeExcessLsForEoD05(this.game).length == 0) {
						Log.log(this.game, undefined, Log.A.end_of_decade_step, [this.game.workflow.subphase]);
						this.game.workflow.subphase++;
						delete this.game.players[0].hamburg;
					}
					this.processEndOfDecade();
				} else {
					if (this.game.workflow.decade >= 4) {
						this.game.endGame(R.FULL_GAME);
						IO.saveGameData(this.game);
						IO.victory(this.game, R.FULL_GAME, this.game.players[1].name);
					} else {
						this.game.workflow.phase = R.CHANGE_HAND;
						this.game.deleteContext();
						IO.saveGameData(this.game);
						this.start();
					}
				}

			}
		}
	},

	nextTurn: function() {

		if (this.context.interruption == undefined) {
			if (this.game.workflow.phase == R.ACTION_PHASE) {
				this.game.useCard(this.context);
				delete this.context;

				if (this.game.remainingTurn() !== true && this.game.firstHalfOfDecade() === true) {
					this.game.cardRow = this.game.currentDeck.splice(0, 7);
				}

				if (this.game.remainingTurn() === true) {
					this.game.nextPlayer();
					this.game.workflow.phase = R.ACTION_PHASE;
					this.view.setInstruction("");
				} else {
					this.game.startEndOfDecade();
					this.processEndOfDecade();
				}
			}
		} else {
			if (this.context.interruption == R.INTERRUPTION_ICON && this.game.workflow.currentPlayer == this.pov) {
				this.context.interruption = R.INTERRUPTION_REPRISE;
				this.game.nextPlayer();
				this.game.saveContext(this.context);
			}
		}

		this.view.refreshPlayers();
		if (this.game.workflow.phase == R.END_OF_DECADE) {
			this.view.endOfDecade();
		} else {
			this.view.cardRow();
		}
		this.view.workflow();
		IO.saveGameData(this.game);
	},

	executeArrows: function() {

		if (R.cards[this.context.card].arrows != undefined && this.context.arrowExecuted != true) {
			var arrows = R.cards[this.context.card].arrows.concat([]);

			if (this.context.removed != undefined && this.context.removed.length == 2) {
				arrows[this.context.removed[0]] -= this.context.removed[1];
			}

			if (arrows != undefined) {
				this.game.modifyLines(arrows);
				this.view.lines();
				if (arrows[0] != 0 || arrows[1] != 0 || arrows[2] != 0) Log.log(this.game, this.game.workflow.currentPlayer, Log.A.arrows, arrows);
				this.context.arrowExecuted = true;
			}
		}

		this.addResetValidateButtons(true, true);
	},

	processEndOfDecade: function() {
		if (this.game.workflow.phase == R.END_OF_DECADE) {

			this.game.deleteContext();
			this.context = {};
			if ((this.game.workflow.subphase == 3 || this.game.workflow.subphase == 5) && this.game.players[0].hamburg == undefined) {
				this.game.workflow.currentPlayer = R.WEST;
				this.context.iconList = [R.SET_HAMBURG];
				this.context.settingHamburg = true;
			} else {
				this.context.iconList = Rules.eventsForEndOfDecadeStep(this.game);
				if (this.game.workflow.subphase == 9) this.view.drawSocialistsBox();
			}
			delete this.context.icon_rank;

			this.view.refreshBoard();
			this.view.endOfDecade();

			if (this.game.workflow.subphase == 2) {
				var val = this.game.lines[0];
				var ref;
				if (val > 0) {
					ref = R.prestigeLine.east;
					this.game.workflow.currentPlayer = R.EAST;
				} else if (val < 0) {
					ref = R.prestigeLine.west;
					this.game.workflow.currentPlayer = R.WEST;
					val = val * -1;
				}

				if (val == 0) {
					$("#actiondetail").empty();
					this.next();
				} else {
					this.view.workflow();

					var tab = [];
					if (this.pov === this.game.workflow.currentPlayer) {
						$("#actiondetail").empty();
						for (var key in ref) {
							if (val >= parseInt(key)) {
								tab.push(ref[key]);
							}
						}

						if (tab.length > 0) {
							this.view.displayActionLines(tab);
							$("#actiondetail").append('<p> Choose a prestige advantage </p>');
							$(".icon_line").on('click', {controller: this}, this.choosePrestige);
						} else {
							$("#actiondetail").empty();
							this.next();
						}
					} else {
						this.game.saveContext(this.context);
						this.addResetValidateButtons(true, true);
					}
				}

			} else {
				 if (this.game.workflow.subphase == 7) {
					this.context.currentProvince = R.SCHLESWIG_HOLSTEIN;
					this.context.startingMassProtest = Rules.massProtestMakers(this.game);
				}
				this.continueEndOfDecade();
			}
		}
	},

	choosePrestige: function(event) {
		var rank = $(event.currentTarget).data('rank');
		var c = event.data.controller;
		var ref;
		var val = c.game.lines[0];
		if (val > 0) {
			ref = R.prestigeLine.east;
		} else if (val < 0) {
			if (val == -1 || val == -2) {
				ref = {1: [Rules.dismantlePrestigeForWest(c.game)]};
			} else {
				ref = R.prestigeLine.west;
			}
			val = val * -1;
		}

		c.context = {};

		var cpt = 0;
		for (var key in ref) {
			if (cpt == rank) {
				c.context.iconList = ref[key];
				break;
			} else {
				cpt++;
			}
		}

		c.context.icon_rank = 0;

		Log.log(c.game, c.game.workflow.currentPlayer, Log.A.choose_prestige);

		$("#actiondetail").empty();
		c.continueEndOfDecade();

	},

	continueEndOfDecade: function() {

		$("#attack").empty();
		if (this.game.workflow.subphase == 7) this.prepareNextProvinceForStep7();

		if (this.context == undefined || this.context.iconList == undefined || this.context.iconList.length == 0 || this.context.icon_rank >= this.context.iconList.length) {
			$("#actiondetail").empty();
			if (this.context.settingHamburg === true) {
				this.processEndOfDecade();
			} else {
				this.next();
			}
		} else {

			this.game.saveContext(this.context);
			if (this.game.workflow.currentPlayer == this.pov) {
				this.prepareEvent();
			} else {
				this.addResetValidateButtons(true, true);
				if (this.context != undefined && this.context.settingHamburg == true) {
					$("#actiondetail").prepend('<p>West must choose Hamburg\'s province</p>')
				}
			}

		}
	},

	prepareNextProvinceForStep7: function() {
		if (this.context.currentProvince > R.THURINGEN) {
			var nb = Rules.massProtestMakersForProvince(this.game, R.WEST_BERLIN) - this.context.startingMassProtest[R.WEST_BERLIN - 50]
			if (nb > 0 && this.context.addingSupplierMP == undefined) {
				var t = [];
				for (var i = 0 ; i < nb ; i++) {
					t.push({
						symbol: R.ADD_SUPPLIER_MP,
						player: R.EAST
					});
				}
				this.context.iconList = t;
				this.context.icon_rank = 0;
				this.context.addingSupplierMP = true;
				delete this.context.icons;
				this.game.workflow.currentPlayer = R.EAST;
			} else {
				delete this.context.addingSupplierMP;
				delete this.context.iconList;
			}
		} else {
			var p = this.game.provinces[this.context.currentProvince-50];
			var ls = this.game.lsForProvince(this.context.currentProvince) - this.context.startingMassProtest[this.context.currentProvince-50];
			var targets = [];
			var force = [];
			if (ls > 0) {
				var current = R.sideForProvince(this.context.currentProvince);
				for (var i = 0 ; i < R.adjacencies[this.context.currentProvince-50].length ; i++) {
					var v = R.adjacencies[this.context.currentProvince-50][i];
					if (this.game.lsForProvince(v) < ls && R.sideForProvince(v) != current) {
						targets.push(v);
						force.push(ls - this.game.lsForProvince(v));
					}
				}
				if (this.context.currentProvince == R.WEST_BERLIN) {
					if (targets.length > 0) {
						var icon = {symbol: R.PLACE_UNREST_E,player: R.WEST, restriction:targets};
						this.context.icon_rank = 0;
						this.context.iconList = [icon];
						$("#attack").append('<p>' + N.provinces[this.context.currentProvince - 50] + ' attacks !</p>');
						for (var i = 0; i < targets.length; i++) {
							Log.log(this.game, R.sideForProvince(this.context.currentProvince), Log.A.must_attack, [this.context.currentProvince,targets[i], force[i]]);
							this.game.unrest(targets[i],force[i]);
						};
						this.endAction();
					} else {
						Log.log(this.game, R.sideForProvince(this.context.currentProvince), Log.A.no_target, [this.context.currentProvince]);
						this.context.currentProvince++;
						this.prepareNextProvinceForStep7();
					}
				} else if (targets.length > 0) {
					var icon = {symbol: R.PLACE_UNREST_E,player: R.WEST, restriction:targets};
					if (current == R.EAST) icon = {symbol: R.PLACE_UNREST_W, player: R.EAST, restriction:targets};
					delete this.context.icons;
					this.context.icon_rank = 0;
					this.context.iconList = [icon];
					$("#attack").append('<p>' + N.provinces[this.context.currentProvince - 50] + ' can attack !</p>');
					this.game.workflow.currentPlayer = current;
				} else {
					if (this.context.currentProvince != R.RHEINLAND_PFALZ && this.context.currentProvince != R.NORDRHEIN_WESTFALEN && this.context.currentProvince != R.BADEN_WURTTEMBERG) {
						Log.log(this.game, R.sideForProvince(this.context.currentProvince), Log.A.no_target, [this.context.currentProvince]);
					}
					this.context.currentProvince++;
					this.prepareNextProvinceForStep7();
				}
			} else {
				Log.log(this.game, R.sideForProvince(this.context.currentProvince), Log.A.no_target, [this.context.currentProvince]);
				this.context.currentProvince++;
				this.prepareNextProvinceForStep7();
			}
		}
	},

	prepareSelectCardsToDiscard: function() {
		if (this.game.players[this.pov-1].hand != undefined && this.game.players[this.pov-1].hand.length > 0) {
			this.context = {};
			this.game.workflow.currentPlayer = this.pov;
			this.view.workflow();
			this.view.discardHand(this.pov-1);
			$(".pointer").on('click',this.toggleCards);
			$(".discardhand").on('click', {controller:this}, this.discardHand);
		} else {
			this.game.players[this.pov-1].ok = true;
			
            if (this.game.players[0].hand == undefined || this.game.players[0].hand.length == 0) {
                this.game.players[0].ok = true;
            }

            if (this.game.players[1].hand == undefined || this.game.players[1].hand.length == 0) {
                this.game.players[1].ok = true;
            }
			
			if (this.game.players[0].ok === true && this.game.players[1].ok === true) {
				this.game.nextDecade();
				this.start();
				IO.saveGameData(this.game);
			} else {
				$("#cardrow").empty();
				IO.saveGameData(this.game);
			}
		}
	},

	toggleCards: function(event) {
		var elem = $(event.currentTarget);
		if (elem.hasClass('selectable')) {
			elem.removeClass('selectable');
			elem.parent().children('.discardWarning').css('visibility', 'hidden');
		} else {
			elem.addClass('selectable');
			elem.parent().children('.discardWarning').css('visibility', 'visible');
		}
	},

	discardHand: function(event) {
		var c = event.data.controller;
		var action = $(event.currentTarget).data('action');

        if (action === 'cancel') {
            $('.pointer.selectable').removeClass('selectable');
            $(".discardWarning").css('visibility', 'hidden');
        } else {
            var dis = [];
            $('.pointer.selectable').each(function() {
                dis.push($(this).data('card'))
            });

            if (dis.length == 0 && c.game.players[c.pov-1].hand != undefined && c.game.players[c.pov-1].hand.length == 3) {
            	alert('You cannot keep 3 cards. Please discard at least one');
            } else {
            	var newHand = [];
            	_.each(c.game.players[c.pov-1].hand, function(carte) {
            		if (dis.indexOf(carte) == -1) newHand.push(carte);
            	});
            	c.game.players[c.pov-1].hand = newHand;

	            c.view.refreshPlayers();
	            c.game.players[c.pov-1].ok = true;

	            if (c.game.players[0].hand == undefined || c.game.players[0].hand.length == 0) {
	                c.game.players[0].ok = true;
	            }

	            if (c.game.players[1].hand == undefined || c.game.players[1].hand.length == 0) {
	                c.game.players[1].ok = true;
	            }

	            if (c.game.players[0].ok === true && c.game.players[1].ok === true) {
	                c.game.nextDecade();
	                c.start();
	                IO.saveGameData(c.game);
	            } else {
	                $("#cardrow").empty();
	                IO.saveGameData(c.game);
	            }
	        }
        }
	},

	prepareGuillaumeAffair: function() {
		this.view.prepareGuillaumeAffairStep1(this.game.players[0].hand.length == 0);
		$('.selectguillaumetype').on('click', {controller: this}, this.chooseGuillaumeType);
	},

	chooseGuillaumeType: function (event) {
		var type = parseInt($(event.currentTarget).data('type'));
		var c = event.data.controller;
		$('.selectguillaumetype').off();

		c.context.guillaumeType = type;
		c.game.saveContext(c.context);
		IO.saveGameData(c.game);

		c.chooseGuillaumeTypeInner(type);

	},

	chooseGuillaumeTypeInner: function(type) {
		var cards;
		if (type == 1) {
			cards = this.game.players[0].hand.concat([]);
			Log.log(this.game, R.EAST, Log.A.guillaumaffair, [0,1]);
		} else {
			Log.log(this.game, R.EAST, Log.A.guillaumaffair, [0,0]);
			cards = this.game.currentDeck.slice(0,2);
		}
		this.view.prepareGuillaumeAffairStep2(cards, this.game.players[1].hand, (type === 2));

		this.startTriggers();
		$('.guillaumeotherside img').on('click', this.selectGuillaumeOtherSide);
		$('.guillaumeownside img').on('click', this.selectGuillaumeOwnSide);
		$("#switchCards").on('click', {controller: this}, this.switchGuillaumeCards);
		$("#deleteCard").on('click', {controller: this}, this.deleteGuillaumeCard);
		$("#doNothing").on('click', {controller: this}, this.guillaumeDoNothing);
	},

	selectGuillaumeOtherSide: function(event) {
		$('.guillaumeotherside img').removeClass('selectable');
		$(event.currentTarget).addClass('selectable');

		$("#deleteCard").show();

		if ($('.guillaumeownside img.selectable').length == 1) {
			$("#switchCards").show();
		}
	},

	selectGuillaumeOwnSide: function(event) {
		$('.guillaumeownside img').removeClass('selectable');
		$(event.currentTarget).addClass('selectable');

		$("#deleteCard").show();

		if ($('.guillaumeotherside img.selectable').length == 1) {
			$("#switchCards").show();
		}
	},

	switchGuillaumeCards: function(event) {
		var c = event.data.controller;

		var index1 = parseInt($('.guillaumeotherside img.selectable').data('index'));
		var index2 = parseInt($('.guillaumeownside img.selectable').data('index'));

		var fromDeck = $("#deleteCard").length > 0;

		var d1;
		if (fromDeck === true) {
			d1 = c.game.currentDeck;
			Log.log(c.game, R.EAST, Log.A.guillaumaffair, [1,0]);
		} else {
			d1 = c.game.players[0].hand;
			Log.log(c.game, R.EAST, Log.A.guillaumaffair, [1,1]);
		}

		var c1 = d1[index1];
		var c2 = c.game.players[1].hand[index2];

		d1[index1] = c2;
		c.game.players[1].hand[index2] = c1;

		c.view.refreshPlayers();
		c.cleanGuillaume = true;
		c.endAction();
	},

	deleteGuillaumeCard: function(event) {
		var c = event.data.controller;

		var index1 = parseInt($('.guillaumeotherside img.selectable').data('index'));
		c.game.currentDeck.splice(index1,1);
		$("#guillaumeaffairehelp").hide();
		c.cleanGuillaume = true;
		Log.log(c.game, R.EAST, Log.A.guillaumaffair, [2]);
		c.endAction();
	},

	guillaumeDoNothing: function(event) {
		var c = event.data.controller;
		$("#guillaumeaffairehelp").hide();
		c.cleanGuillaume = true;
		Log.log(c.game, R.EAST, Log.A.guillaumaffair, [3]);
		c.endAction();
	},

	activatePolice: function(event) {
		var c = event.data.controller;
		if (c.context == undefined) c.context = {};
		c.context.backup_phase = c.game.workflow.phase;
		c.game.workflow.phase = R.POLICE_ACTIVATION;
		var p = Rules.possibleSpotsForRemoveUnrest(c.game);
		c.view.setInstruction("Remove an unrest token, seized by the police");
		c.propose({provinces:p});
	},

	prepareAskExternalFactories: function(factories) {
		this.view.prepareAskExternalFactories(factories);
		$(".assign").on('click', {controller:this}, this.chooseExternalFactoryProvince);
	},

	chooseExternalFactoryProvince: function(event) {
		var c = event.data.controller;
		var province = parseInt($(event.currentTarget).data('province'));
		var factory = parseInt($(event.currentTarget).data('factory'));

		var p = c.game.players[1];
		if (p.externalFactories == undefined) p.externalFactories = [-1,-1,-1,-1];
		p.externalFactories[factory - R.POLSKA_N] = province;

		c.context.external--;
		$(event.currentTarget).parent().remove();
		if (c.context.external == 0) {
			delete c.context.external;
			c.context.buildpoints = R.giveCardValueForSide(c.context.card, c.game.workflow.currentPlayer);
			c.context.iconList = Rules.iconsForAction(c.game, c.context.action, c.context.buildpoints);
			c.prepareEvent();
		}
	}
}