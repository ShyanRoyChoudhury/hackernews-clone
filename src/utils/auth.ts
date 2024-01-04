import * as jwt from "jsonwebtoken";

export const AppSecret = "s3CrEt"

export interface AuthTokenPayload {  // 1
    userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload { // 2
    const token = authHeader.replace("Bearer ", "");  // 3

    if (!token) {
        throw new Error("No token found");
    }
    return jwt.verify(token, AppSecret) as AuthTokenPayload;  // 4
}