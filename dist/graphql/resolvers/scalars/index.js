"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scalarsResolvers = void 0;
const graphql_1 = require("../../../graphql");
const language_1 = require("graphql/language");
exports.scalarsResolvers = {
    DateTime: new graphql_1.GraphQLScalarType({
        name: "DateTime",
        description: "A valid date time value.",
        serialize: (value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return new Date(value).toISOString();
        },
        parseValue: (value) => {
            return new Date(value);
        },
        parseLiteral: (ast) => {
            if (ast.kind === language_1.Kind.STRING) {
                return new Date(ast.value);
            }
            throw new Error("Invalid date format");
        },
    }),
};
exports.default = exports.scalarsResolvers;
//# sourceMappingURL=index.js.map