import { Request, Response, NextFunction } from "express";
import { GraphQLContext } from "../types";
import { IPengguna } from "../models/Pengguna";
export declare const requireAuth: (context: GraphQLContext) => IPengguna;
export declare const requireVerification: (context: GraphQLContext) => IPengguna;
export declare const requireAdmin: (context: GraphQLContext) => IPengguna;
export declare const setupContext: (req: any) => Promise<GraphQLContext>;
export declare const restAuthMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authMiddleware.d.ts.map