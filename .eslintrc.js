module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: "latest",
	},
	rules: {
		"no-constant-binary-expression": "error",
		indent: [ "warn", "tab", { SwitchCase: 1 } ],
		semi: [ "error", "never" ],
		"no-unused-vars": [ "error", { "vars": "all", "args": "all", "varsIgnorePattern": "^[CS]_", "argsIgnorePattern": "^_" } ],
	},
}
