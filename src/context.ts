import { PrismaClient } from "@prisma/client";
import { Request } from "express"
import { decodeAuthHeader } from "./utils/auth";
import { Token } from "graphql";
export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    userId?: number;
}

export const context = ({ req }: { req: Request }): Context => {
    try{
        const token = req && req.headers.authorization? decodeAuthHeader(req.headers.authorization): null;
        console.log('token: ',token)
        return {
            prisma,
            userId: token?.userId
        }
    }catch(e){
        console.error("Error decoding token:");
        return{
            prisma,
        }
    }
};