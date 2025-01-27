"use strict";

const WEST = "West";
const EAST = "East";

var game,
	view,
	states = {};

const R = require("./data.js");

// Needed
exports.scenarios = ["Standard"];

exports.roles = [WEST, EAST];

function _random(range, seed) {
	return (seed = (seed * 200105) % 34359738337) % range;
}

function _shuffle(list, seed) {
	// Fisher-Yates shuffle
	for (let i = list.length - 1; i > 0; --i) {
		let j = _random(i + 1, seed);
		let tmp = list[j];
		list[j] = list[i];
		list[i] = tmp;
	}
}

/* returns the initial state */
exports.setup = function (seed, scenario, options) {
	let deck = [].concat(R.BASE_DECK);
	_shuffle(deck, seed);
	let card_row = deck.splice(0, 7);
	let west_hand = deck.splice(0, 2);
	let east_hand = deck.splice(0, 2);
	game = {
		active: WEST,
		state: "Starting",
		log: ["you start"],
		seed,
		flight: 0,
		flight_track: 0,
		markers: [0, 0, 0],
		deck,
		card_row,
		east_card: 81,
		players: {
			west: {
				hand: west_hand,
			},
			east: {
				hand: east_hand,
			},
		},
		factories: R.STARTING_FACTORIES,
		infrastructures: [],
	};

	return game;
};

/* Returns the view for the player */
exports.view = function (state, player) {
	console.log("state: " + player);
	console.log(state);

	//	game = state;
	let hand = player == WEST ? state.players.west.hand : state.players.east.hand;
	return {
		log: state.log,
		prompt: "Choose anything to do 2",
		flight_marker: state.flight,
		flight_track_marker: state.flight_track,
		markers: state.markers,
		card_row: state.card_row,
		east_card: state.east_card,
		player_hand: hand,
	};
};
