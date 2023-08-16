export const RESPONSES = Object.freeze({
	moduleNotFound: Object.freeze(["moduleNotFound", "The requested module was not found."] as const),
	stateUndefined: Object.freeze(["stateUndefined", "State is not defined at call time."] as const),
	invalidCommand: Object.freeze(["invalidCommand", "Invalid command."] as const),
	invalidArgs: Object.freeze(["invalidArgs", "Invalid Arguments for command."] as const),
	unknownError: Object.freeze(["unknownError", "An unknown error occurred."] as const),
});
