import { GraphQLFormattedError } from "../graphql";
interface FormattedErrorResponse extends GraphQLFormattedError {
    extensions: {
        code: string;
        statusCode: number;
        timestamp: string;
        path?: readonly (string | number)[];
        details?: unknown;
        stacktrace?: string[];
    };
}
export declare const formatGraphQLError: (formattedError: GraphQLFormattedError, error: unknown) => FormattedErrorResponse;
export declare const generateRequestId: () => string;
export declare const requestLogger: (req: any, _res: any, next: () => void) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map