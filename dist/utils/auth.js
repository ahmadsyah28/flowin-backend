"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailToken = exports.generateVerificationToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@/config");
const errors_1 = require("./errors");
const generateToken = (pengguna) => {
    const payload = {
        userId: pengguna._id.toString(),
        email: pengguna.email,
        role: "users",
        type: "access",
    };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
        expiresIn: config_1.config.jwt.expiresIn,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
    }
    catch (err) {
        throw (0, errors_1.authenticationError)("Token tidak valid atau sudah kedaluwarsa");
    }
};
exports.verifyToken = verifyToken;
const generateVerificationToken = () => {
    const options = {
        expiresIn: "24h",
    };
    return jsonwebtoken_1.default.sign({ purpose: "email_verification" }, config_1.config.jwt.secret, options);
};
exports.generateVerificationToken = generateVerificationToken;
const verifyEmailToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        return decoded.purpose === "email_verification";
    }
    catch (error) {
        return false;
    }
};
exports.verifyEmailToken = verifyEmailToken;
//# sourceMappingURL=auth.js.map