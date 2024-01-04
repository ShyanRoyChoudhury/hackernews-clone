import { extendType, intArg, nonNull, objectType } from "nexus";
import { User } from "@prisma/client";

export const Vote = objectType({
    name: "Vote",
    definition(t) {
        t.nonNull.field("link", { type: "Link"}),
        t.nonNull.field("user", { type: "User"})
    },
});

export const VoteMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("vote", {
            type: "Vote",
            args: {
                linkId: nonNull(intArg())
            },

            async resolve(parent, args, context){
                const { userId } = context;
                const { linkId } = args;
                
                if(!userId){
                    throw new Error("Cannot Post without logging in");
                }

                const link = await context.prisma.link.update({
                    where:{
                        id: userId
                    },
                    data: {
                        voters:{
                            connect:{
                                id: userId
                            }
                        }
                    }
                })

                const user = await context.prisma.user.findUnique({
                    where: {
                        id: linkId
                    }
                })

                return{
                    link,
                    user: user as User
                }
            }
        })
    },
})