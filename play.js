const ui = {
	markers: document.getElementById("markers"),
};

const div = (className, top, left) => {
	let d = document.createElement("div");
	d.className = className;
	d.style.top = top + "px";
	d.style.left = left + "px";
	return d;
};

function create_ui() {
	ui.markers.append(div("marker prestige", 50, 454));
	ui.markers.append(div("marker wc", 84, 454));
	ui.markers.append(div("marker socialist", 115, 454));
	ui.markers.append(div("marker flight", 151, 193));
	ui.markers.append(div("marker flight_track", 1944, 67));
}

function on_update() {
	if (!ui.spaces) {
		create_ui();
	}
}
