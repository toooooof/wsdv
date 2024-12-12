var R = {

	// cities
	FLENSBURG:1,
	KIEL: 2,
	HAMBURG: 3,  
	BREMEN: 4,
	HANOVER: 5,
	WOLFSBURG: 6,
	BIELEFELD: 7,
	DUISBURG: 8,
	DORTMUND: 9,
	KOLN: 10,
	KASSEL: 11,
	GIESSEN: 12,
	FULDA: 13,
	FRANKFURT: 14,
	KOBLENZ: 15,
	SAARBRUCKEN: 16,
	KAISERSLAUTERN: 17,
	MANHEIM: 18,
	HEILBRONN: 19,
	STUTTGART: 20,
	ULM: 21,
	BAYREUTH: 22,
	NURNBERG: 23,
	INGOLSTADT: 24,
	MUNCHEN: 25,
	ROSTOCK: 26,
	NEUBRANDENBURG: 27,
	SCHWEDT: 28,
	RHEINSBERG: 29,
	BERLIN_EAST: 30,
	COTTBUS: 31,
	MAGDEBURG: 32,	
	BITTERFELD: 33,
	LEIPZIG: 34,
	DRESDEN: 35,
	KARLMARXSTADT: 36,
	EISENACH: 37,
	JENA: 38,
	POLSKA_N: 39,
	POLSKA_S: 40,
	CSSR_N: 41,
	CSSR_S: 42,
	BERLIN_F: 43,
	BERLIN_E: 44,
	BERLIN_US: 45,

	// provinces
	SCHLESWIG_HOLSTEIN: 50,
	NIEDERSACHSEN: 51,
	NORDRHEIN_WESTFALEN: 52,
	HESSEN: 53,
	RHEINLAND_PFALZ: 54,
	BADEN_WURTTEMBERG: 55,
	BAYERN: 56,
	WEST_BERLIN: 57,
	MECKLENBURG_VORPOMMERN: 58,
	BRANDENBURG: 59,
	EAST_BERLIN: 60,
	SACHSEN_ANHALT: 61,
	SACHSEN: 62,
	THURINGEN: 63,

	WEST_GERMANY: 64,
	EAST_GERMANY: 65,
	CSSR: 66,
	POLSKA: 67,

	// Phase 
	ACTION_PHASE: 1,
	END_OF_DECADE: 7,

	DISMANTLE: 8,
	POLICE_ACTIVATION: 9,

	CHANGE_HAND: 10,

	END_OF_GAME: 42,

	// Interruptions
	INTERRUPTION_ICON: 1,
	INTERRUPTION_REPRISE: 2,
	INTERRUPTION_LINES: 3,
	INTERRUPTION_SOCIALISTS: 4,

	// actions
	PLACE_UNREST_W: 1,
	PLACE_UNREST_E: 2,
	REMOVE_UNREST_W: 3,
	REMOVE_UNREST_E: 4,
	MOVE_UNREST_E: 5,
	BUILD_W: 6,
	BUILD_E: 7,
	DISBAND_W: 8,
	DISBAND_E: 9,
	REMOVE_MASS_PROTEST: 10,
	PUT_LS_W: 11,
	PUT_LS_LIMITED_W: 12,
	REMOVE_LS_E: 13,
	STOP_FACTORY_E: 14,
	RUNDOWN_FACTORY_E: 15,
	REPAIR_FACTORY_E: 16,
	RED_POLICE: 17,
	PINK_POLICE: 18,
	BUILD_BERLIN_WALL: 19,
	REMOVE_BERLIN_WALL: 20,
	STASI_DISBANDMENT: 21,
	GUILLAUME_AFFAIR: 22,
	PUT_LS_E: 23,
	REMOVE_LS_W: 24,
	REMOVE_SOCIALISTS: 25,
	ADD_SUPPLIER_MP: 26,
	PUT_LS: 27,
	ADD_SOCIALISTS: 28,
	SET_HAMBURG: 29,
	BONUS_PRESTIGE_W: 30,
	BONUS_WC_W: 31,
	BONUS_SOCIALIST_W: 32,
	BONUS_PRESTIGE_E: 33,
	BONUS_WC_E: 34,
	BONUS_SOCIALIST_E: 35,

	// victoires
	NATIONAL_INSOLVENCY: 1,
	TRIUMPH_OF_SOCIALISM: 2,
	SOCIALISM_FAILS: 3,
	EAST_COLLAPSE: 4,
	WEST_COLLAPSE: 5,
	DOUBLE_COLLAPSE: 6,
	FULL_GAME: 7,

	// color
	WEST: 1,
	EAST: 2,
	DUAL: 3, 

	roads: [[1,2],[1,3,-2],[2,3],[3,4],[3,5,-2],[3,6],[4,8,-2],[4,7],[5,7],[5,6],[6,11],[7,9],[8,9],[8,10],[9,10],[9,11],[10,14],[10,15],[11,12],[12,14],[13,14],[13,22,-2],
			[13,23],[14,15],[14,18],[15,16],[16,17],[17,18],[17,20],[18,19],[18,20],[19,20],[19,23],[19,25],[20,21],[20,25],[21,25],[22,23],[22,24],[23,24],[23,25],[24,25],
			[26,27],[26,32,-2],[27,28],[27,39],[28,30],[28,39],[28,40],[30,31],[30,32],[30,33,-2],[30,40],[31,35],[31,41],[32,37,-2],[32,33],[33,34],[33,37],[33,38],[34,35],[34,38,-2],
			[35,36],[35,41],[36,38],[36,42],[37,38],[38,42]],
	provinces: [[1,2,3],[4,5,6],[7,8,9,10],[11,12,13,14],[15,16,17],[18,19,20,21],[22,23,24,25],[43,44,45],
				[26,27],[28,29,31],[30],[32,33],[34,35,36],[37,38],[50,51,52,53,54,55,56],[]],

	adjacencies: [[51,58],[50,52,53,58,59,61],[51,53,54],[51,52,54,55,56,61,63],[52,53,55],[53,54,56],[53,55,62,63],[59,60],[50,51,59],[51,57,58,60,61,62],[57,59],
	[51,53,59,62,63],[56,59,61,63],[53,56,61,62]],

	externalFactoriesLinkedProvinces: [[58,59],[59,60],[59,62],[62,63]],

	prestigeLine: {
		west: {
			1: [15],
			3: [2],
			4: [2,9],
			5: [2,13],
			6: [2,9,13]
		},
		east: {
			1: [7],
			2: [4],
			3: [7,4],
			4: [23],
			5: [23,4],
			6: [23,4,7]
		}
	},

	socialistsLine: [1,1,2,2,3,4],

	cards: [{},

		{value:2,color:2,icons:[4,4],arrows:[0,-1,1]}, //1
		{value:[1,3],color:2,icons:[7,2],arrows:[0,0,2],flight:1},
		{value:1,color:2,icons:[7,7],arrows:[0,1,0]},
		{value:3,color:2,icons:[{symbol:1,restriction:64},{symbol:1,restriction:64}],arrows:[2,0,0]},
		{value:1,color:2,icons:[4,17],arrows:[1,0,0]}, //5
		{value:1,color:2,icons:[7,7,2],arrows:[0,0,1]},
		{value:2,color:2,icons:[{symbol:7,restriction:66},{symbol:7,restriction:66},{symbol:7,restriction:67},{symbol:7,restriction:67},2],arrows:[0,1,0]},
		{value:2,color:2,icons:[8,8,{symbol:1,restriction:54}],arrows:[1,0,0]},
		{value:2,color:2,icons:[{symbol:7,restriction:66},{symbol:7,restriction:66},{symbol:7,restriction:67},{symbol:7,restriction:67},2],arrows:[1,0,0]},
		{value:[1,2],color:2,icons:[1,4],arrows:[0,0,2]}, //10
		{value:1,color:3,icons:[{symbol:1,restriction:64,player:2}],arrows:[-1,0,0]},
		{value:1,color:1,icons:[8,1],arrows:[-2,0,0],flight:1},
		{value:2,color:1,icons:[6,6,6,{symbol:3,restriction:64}]},
		{value:2,color:1,icons:[6,{symbol:3,restriction:57},{symbol:3,restriction:57}],arrows:[0,-1,0]},
		{value:1,color:3,icons:[{symbol:6,player:1},{symbol:9,player:1},18],arrows:[0,0,1]}, //15
		{value:[4,1],color:1,icons:[{symbol:2,max:2},{symbol:2,max:2},{symbol:2,max:2},{symbol:2,max:2}],arrows:[0,0,-1]}, 
		{value:[3,1],color:1,icons:[9,9,9,2],arrows:[0,0,-1]}, 
		{value:2,color:1,icons:[3,3],arrows:[-2,0,0]}, 
		{value:2,color:1,icons:[6,6],arrows:[-1,0,0]}, 
		{value:[4,1],color:1,icons:[6,6,6,{symbol:3,restriction:64},2]}, //20

		{value:1,color:3,icons:[17,4],arrows:[0,-1,-1]}, 
		{value:1,color:3,icons:[{symbol:3,restriction:57},{symbol:3,restriction:57},4,4],arrows:[0,1,0]},
		{value:[1,3],color:2,icons:[7,7,7,2],arrows:[0,1,0]}, 
		{value:2,color:2,icons:[{symbol:1,restriction:64},4,4],arrows:[0,0,1]}, 
		{value:[1,3],color:2,icons:[{symbol:1,restriction:57},{symbol:1,restriction:57},{symbol:1,restriction:64},{symbol:1,restriction:64}]}, //25
		{value:[1,3],color:2,icons:[{symbol:1,max:2},{symbol:1,max:2},{symbol:1,max:2}],arrows:[0,0,1]}, 
		{value:2,color:2,icons:[{symbol:7,restriction:29},{symbol:7,restriction:29}],arrows:[1,0,0]}, 
		{value:2,color:2,icons:[4],arrows:[1,0,1],flight:1},
		{value:2,color:2,icons:[7,7,2],arrows:[0,2,0]}, 
		{value:1,color:3,icons:[4],arrows:[0,2,-1]}, //30
		{value:2,color:2,arrows:[2,0,0]}, 
		{value:1,color:2,icons:[1],arrows:[1,0,0],flight:1}, 
		{value:2,color:2,icons:[1,1],arrows:[1,0,0]}, 
		{value:1,color:2,icons:[7,4]},
		{value:3,color:1,icons:[{symbol:11,restriction:64,max:1},{symbol:11,restriction:64,max:1},2]}, //35 
		{value:2,color:1,icons:[3,3],arrows:[-1,0,0]}, 
		{value:[3,1],color:1,icons:[{symbol:14,restriction:66},2],arrows:[0,0,-2]}, 
		{value:1,color:1,arrows:[-1,-1,0]},  
		{value:[3,1],color:1,icons:[{symbol:3,restriction:57},3,3],arrows:[-1,0,0]}, 
		{value:2,color:1,icons:[1],arrows:[-2,0,0]}, //40

		{value:1,color:3,icons:[{symbol:6,player:1},{symbol:3,player:1}],arrows:[0,2,0]}, 
		{value:1,color:3,icons:[{symbol:3,player:1},{symbol:3,player:1},{symbol:3,player:1}],arrows:[2,1,0]}, 
		{value:3,color:2,icons:[{symbol:8,restriction:52},{symbol:8,restriction:52},{symbol:8,restriction:52},{symbol:1,restriction:52}]}, 
		{value:[1,3],color:2,icons:[{symbol:1,max:2},{symbol:1,max:2},{symbol:1,max:2},{symbol:1,max:2}],arrows:[1,0,0]},  
		{value:2,color:3,icons:[{symbol:4,player:2},{symbol:4,player:2}],arrows:[0,-1,1]}, //45 
		{value:2,color:2,icons:[{symbol:23,restriction:60},{symbol:16,restriction:60},15],arrows:[0,0,1]},  
		{value:2,color:2,icons:[23,4],arrows:[1,0,0]},  
		{value:1,color:3,icons:[2],arrows:[0,-2,2],flight:1},  
		{value:2,color:2,icons:[4,17]},  
		{value:1,color:2,icons:[1,22],arrows:[1,0,0]}, //50 
		{value:1,color:3,icons:[18],arrows:[-2,0,1]},  
		{value:2,color:2,icons:[8,1],arrows:[1,0,0],flight:1},  
		{value:1,color:2,arrows:[0,2,0]},  
		{value:[1,3],color:2,icons:[8,8,8,8]},  
		{value:2,color:1,icons:[1],arrows:[-2,0,0]}, //55 
		{value:[3,1],color:1,icons:[6,6],arrows:[0,-1,-1]},  
		{value:[3,1],color:1,icons:[2,2],arrows:[0,0,-2]},  
		{value:2,color:1,icons:[2],arrows:[0,0,-2]},  
		{value:2,color:1,icons:[{symbol:2,restriction:60},{symbol:2,restriction:60}],arrows:[0,0,-1]},   
		{value:[3,1],color:1,icons:[{symbol:12,restriction:56},{symbol:1,restriction:56}],arrows:[-2,0,0],flight:1}, //60

		{value:1,color:3,icons:[{symbol:1,player:2},{symbol:1,player:2},{symbol:2,player:1},{symbol:2,player:1}],flight:1},  
		{value:1,color:3,icons:[{symbol:1,player:2,restriction:64},{symbol:1,player:2,restriction:64},{symbol:2,player:1},{symbol:2,player:1}],flight:1},  
		{value:[1,3],color:2,icons:[{symbol:8,restriction:[51,3]},{symbol:8,restriction:[51,3]},{symbol:8,restriction:[51,3]}]},  
		{value:1,color:2,icons:[{symbol:3,player:1},{symbol:3,player:1},4],arrows:[0,2,0]},  
		{value:3,color:2,icons:[{symbol:3,player:1},4,4],arrows:[0,0,1]}, //65 
		{value:2,color:2,icons:[5,5,18],arrows:[0,0,-1]},  
		{value:2,color:2,icons:[{symbol:23,restriction:62},4],arrows:[1,0,0]},  
		{value:2,color:2,icons:[{symbol:1,restriction:56},{symbol:1,restriction:64},{symbol:1,restriction:64}],arrows:[1,0,0]},  
		{value:1,color:2,icons:[1]},  
		{value:2,color:1,icons:[6,6,6],arrows:[-1,0,0]}, //70
		{value:2,color:1,icons:[2],arrows:[0,-1,-1]},   
		{value:[4,1],color:1,icons:[9,9],arrows:[0,-2,0]},  
		{value:[4,1],color:1,icons:[{symbol:14,restriction:67}],arrows:[0,0,-2]},  
		{value:[3,1],color:1,icons:[2,2],arrows:[0,0,-1]},  
		{value:1,color:1,arrows:[0,0,-1],flight:1}, //75 
		{value:2,color:1,icons:[6,3],arrows:[-1,0,0]},   
		{value:2,color:1,icons:[{symbol:2,restriction:62},5,5],arrows:[0,0,-2]},  
		{value:1,color:1,icons:[5,5],arrows:[0,0,-1],flight:1},  
		{value:2,color:1,icons:[11,3],arrows:[0,-2,0]},  
		{value:[3,1],color:1,icons:[9,9,2],arrows:[-1,0,0]},  //80

		{value:0,color:2,icons:[10,10,4,4],arrows:[-1,0,1],flight:2},  
		{value:0,color:2,icons:[19]},  
		{value:0,color:2,icons:[23,23],arrows:[0,-2,2]},  
		{value:0,color:2,icons:[21,{symbol:10,player:1}],arrows:[0,-1,0]},  // IV
		{value:0,color:2,icons:[20,21,4],arrows:[1,0,2],flight:1}  // IV verso


	],
	

	provinceForCity: function(city)  {
		for (var i = 0 ; i < this.provinces.length; i++) {
			if (this.provinces[i].indexOf(city) > -1) {
				return (50+i);
			}
		} 
		return -1;
	},

	provincesForRoad: function(link)  {
		var res = [];
		
		var road = this.roads[Math.floor(link)];
		if (this.provinceForCity(road[0]) > -1) res.push(this.provinceForCity(road[0]));
		var p = this.provinceForCity(road[1]);
		if (res.indexOf(p) == -1 && p > -1) res.push(p);

		return res;
	},

	sideForProvince: function(province) {
		if (province >= R.SCHLESWIG_HOLSTEIN && province <= R.WEST_BERLIN) {
			return R.WEST;
		} else if (province >= R.MECKLENBURG_VORPOMMERN && province <= R.THURINGEN) {
			return R.EAST;
		}
		return -1;
	},

	sideForCity: function(city) {
		if (city == R.HAMBURG) return R.WEST;
		return this.sideForProvince(this.provinceForCity(city));
	},

	sideForRoad: function(link) {
		if (link < 42) return R.WEST;
		else return R.EAST;
	},

	giveCardValueForSide: function(index, side) {
		var c = this.cards[index].value;
		if (!isNaN(c)) return c;
		if (c.length == 2) return c[side - 1];
	},

	giveInitDeckDecade: function(decade) {
		var deck = [];
		for (var i = 1 ; i <= 20 ; i++) {
			deck.push(i+(decade-1)*20);
		}
		return _.shuffle(deck);
	},

	setHamburgTo : function(province) {
		if (province == R.SCHLESWIG_HOLSTEIN || province == R.NIEDERSACHSEN) {
			if (this.provinces[R.SCHLESWIG_HOLSTEIN-50].indexOf(R.HAMBURG) > -1) this.provinces[R.SCHLESWIG_HOLSTEIN-50].splice(this.provinces[R.SCHLESWIG_HOLSTEIN-50].indexOf(R.HAMBURG),1);
			else if (this.provinces[R.NIEDERSACHSEN-50].indexOf(R.HAMBURG) > -1) this.provinces[R.NIEDERSACHSEN-50].splice(this.provinces[R.NIEDERSACHSEN-50].indexOf(R.HAMBURG),1);
			this.provinces[province - 50].push(R.HAMBURG);
		}
	},

	givePhaseName : function(phase) {
		switch(phase) {
			case this.END_OF_DECADE :
				return "End of Decade";
			case this.CHANGE_HAND :
				return "Discarding hand";
			default :
				return "Actions";
		}
	},

	giveWinningSide: function(condition) {
		switch (condition) {
			case this.NATIONAL_INSOLVENCY: return R.WEST;
			case this.TRIUMPH_OF_SOCIALISM: return R.EAST;
			case this.SOCIALISM_FAILS: return R.WEST;
			case this.EAST_COLLAPSE: return R.WEST;
			case this.WEST_COLLAPSE: return R.EAST;
			case this.DOUBLE_COLLAPSE: return R.EAST;
			case this.FULL_GAME: return R.EAST;
		}
	},

	giveWinningConditionString: function(condition) {
		switch (condition) {
			case this.NATIONAL_INSOLVENCY: return "National Insolvency";
			case this.TRIUMPH_OF_SOCIALISM: return "Triumph of Socialism";
			case this.SOCIALISM_FAILS: return "Socialism fails";
			case this.EAST_COLLAPSE: return "East collapses";
			case this.WEST_COLLAPSE: return "West collapses";
			case this.DOUBLE_COLLAPSE: return "Both sides collapse. East wins";
			case this.FULL_GAME: return "East wins at the end of the game";
		}
	},

	giveSideName: function(side) {
		if (side == R.EAST) {
			return "East";
		} else if (side == R.WEST) {
			return "West";
		} else {
			return "";
		}
	},

	isPrestigeIcon: function(type) {
		return [R.BONUS_PRESTIGE_E, R.BONUS_PRESTIGE_W, R.BONUS_WC_E, R.BONUS_WC_W, R.BONUS_SOCIALIST_E, R.BONUS_SOCIALIST_W].indexOf(type) > -1;
	}
};


