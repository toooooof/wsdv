const PRESTIGE = 0;
const WC = 1;
const SOCIALIST = 2;

function $(id) {
	return document.getElementById(id);
}

const ui = {
	markers: [$("prestige_marker"), $("wc_marker"), $("socialist_marker")],
	flight_marker: $("flight_marker"),
	flight_track_marker: $("flight_track_marker"),
};

const div = (className, top, left) => {
	let d = document.createElement("div");
	d.className = className;
	if (top) d.style.top = top + "px";
	if (left) d.style.left = left + "px";
	return d;
};

function create_ui() {
	ui.spaces = [];
	ui.card_row = [];
	ui.player_hand = [];

	if (view.east_card) {
		const card = div("card c" + view.east_card);
		$("card_row").append(card);
		ui.card_row.push(card);
	}
	view.card_row.forEach((element) => {
		const card = div("card c" + element);
		$("card_row").append(card);
		ui.card_row.push(card);
	});
	if (view.player_hand) {
		view.player_hand.forEach((element) => {
			const card = div("card c" + element);
			$("player_hand").append(card);
			ui.player_hand.push(card);
		});
	}
}

/* View is global */
function on_update() {
	console.log("on update, view:");
	console.log(view);
	if (!ui.spaces) {
		create_ui();
	}
	console.log(view.player_hand);

	ui.markers[PRESTIGE].style.left = 454 + view.markers[PRESTIGE] * 65 + "px";
	ui.markers[WC].style.left = 454 + view.markers[WC] * 65 + "px";
	ui.markers[SOCIALIST].style.left = 454 + view.markers[SOCIALIST] * 65 + "px";
	ui.flight_marker.style.top = 151 + view.flight * 65 + "px";
	ui.flight_track_marker.style.left = 67 + view.flight_track_marker * 65 + "px";
}
