"use strict";

const WEST = "West";
const EAST = "East";

// Needed
exports.scenarios = ["Standard"];

exports.roles = [WEST, EAST];

exports.setup = function (seed, scenario, options) {
  console.log(seed + " " + scenario + " " + options);

  return { active: WEST, state: "Starting", log: [] };
};

exports.view = function (state, player) {
  return {
    log: state.log,
    prompt: "Choose anything to do",
  };
};
