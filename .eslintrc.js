module.exports = {
	"ignorePatterns": [
		"node_modules/**",
		"build/**",
		"dist/**",
		"NetscriptDefinitions.d.ts",
		".eslintrc.js",
	],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:@typescript-eslint/strict",
	],
	"parser": "@typescript-eslint/parser",
	"plugins": ["@typescript-eslint"],
	"env": {
		"browser": true,
		"es2021": true
	},
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module",
		"project": ["./tsconfig.json"],
	},
	"rules": {
		// project rules
		"no-await-in-loop": "off",
		// overridden rules
		"camelcase": "off",
		"default-param-last": "off",
		"no-constant-condition": "off",
		"no-duplicate-imports": "off",
		"no-empty-function": "off",
		"no-shadow": "off",
		"no-unused-vars": "off",
		// rules
		"curly": ["warn","all"],
		// "no-await-in-loop": ["warn"],
		"no-else-return": ["warn"],
		"no-template-curly-in-string": ["warn"],
		"no-unneeded-ternary": ["warn"],
		"spaced-comment": ["warn", "always", { "exceptions": ["-", "+", "/"] }],
		"@typescript-eslint/default-param-last": ["warn"],
		"@typescript-eslint/naming-convention": [
			"warn",
			{
				"selector": "default",
				"format": ["camelCase"]
			},
			{
				"selector": ["objectLiteralMethod","objectLiteralProperty"],
				"format": null,
				"filter": {
					"regex": "^\\d+$",
					"match": true
				}
			},
			{
				"selector": "variable",
				"format": ["camelCase"],
			},
			{ // global consts
				"selector": "variable",
				"modifiers": ["global","const"],
				"format": ["UPPER_CASE"]
			},
			{ // bool variables
				"selector": "variable",
				"types": ["boolean"],
				"format": ["PascalCase"],
				"prefix": ["is", "should", "has", "can", "did", "will"]
			},
			{
				"selector": "parameter",
				"format": ["camelCase"],
			},
			{ // unused parameters
				"selector": "parameter",
				"modifiers": ["unused"],
				"format": ["camelCase"],
				"leadingUnderscore": "require"
			},
			{ // private
				"selector": "memberLike",
				"modifiers": ["private"],
				"format": ["camelCase"],
				"leadingUnderscore": "require"
			},
		],
		"@typescript-eslint/no-duplicate-imports": ["warn"],
		"@typescript-eslint/no-empty-function": ["warn"],
		"@typescript-eslint/no-shadow": ["warn"],
		"@typescript-eslint/no-unnecessary-condition": ["warn",{
			"allowConstantLoopConditions": true,
		}],
		"@typescript-eslint/no-unused-vars": ["warn",{
			"argsIgnorePattern": "^_",
			"varsIgnorePattern": "^_",
			"caughtErrorsIgnorePattern": "^_"
		}],
		"@typescript-eslint/restrict-template-expressions": ["error",{
			"allowBoolean": true,
		}],
		"@typescript-eslint/switch-exhaustiveness-check": ["warn"],
		// Style
		"array-bracket-newline": ["warn", "consistent"],
		"array-element-newline": ["warn", "consistent"],
		"eol-last": ["warn"],
		"function-paren-newline": ["warn", "consistent"],
		"indent": ["warn", "tab"],
		"no-multiple-empty-lines": ["warn", { "max": 2, "maxEOF": 1 }],
		"no-trailing-spaces": ["warn"],
		"@typescript-eslint/block-spacing": ["warn","never"],
		"@typescript-eslint/brace-style": ["warn", "1tbs", {"allowSingleLine":true}],
		"@typescript-eslint/comma-dangle": ["warn", "always-multiline"],
		"@typescript-eslint/comma-spacing": ["warn"],
		"@typescript-eslint/func-call-spacing": ["warn"],
		"@typescript-eslint/key-spacing": ["warn"],
		"@typescript-eslint/keyword-spacing": ["warn"],
		"@typescript-eslint/member-delimiter-style": ["warn"],
		"@typescript-eslint/no-base-to-string": ["error",{
			"ignoredTypeNames": [
				"Error",
				"RegExp",
				"URL",
				"URLSearchParams",
				"Boolean",
				"boolean",
			]
		}],
		"@typescript-eslint/no-extra-parens": ["warn"],
		"@typescript-eslint/object-curly-spacing": ["warn"],
		"@typescript-eslint/quotes": ["warn"],
		"@typescript-eslint/semi": ["warn"],
		"@typescript-eslint/space-before-blocks": ["warn"],
		"@typescript-eslint/space-before-function-paren": ["warn","never"],
		"@typescript-eslint/type-annotation-spacing": ["warn"],
	}
}