import { extendType, intArg, nonNull, objectType, stringArg, arg, inputObjectType, enumType, list } from "nexus";
import { NexusGenObjects } from '../../nexus-typegen'
import { Prisma } from "@prisma/client";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.dateTime("createdAt");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context){
                return context.prisma.link
                    .findUnique({ where:{ id: parent.id } })
                    .voters()
            }
        })
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({type: list(nonNull(LinkOrderByInput))})
            },
            async resolve(parent, args, context){
                const where = args.filter ? {
                    OR : [
                       { description: {contains: args.filter} },
                       { url: { contains: args.filter } }
                    ]
                }
                : {};

                const links =  context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,
                });
                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`

                return{
                    links,
                    count,
                    id
                }
            }
        }),

        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg())
            },

            resolve(parent, args, context, info){

                const search = context.prisma.link.findUnique({
                    where:{
                        id: args.id
                    }
                })
                return search;
            }
        });
    },
})

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t){
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },

            resolve(parent, args, context) {
                const { userId } = context;

                if(!userId){
                    throw new Error("Cannot post without Loggin in");
                }

                const newLink = context.prisma.link.create({
                    data:{
                        description: args.description,
                        url: args.url,
                        postedBy: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                })

                return newLink;
            }
        })

        t.field("updateLink", {             // needs fix
            type: "Link",
            args:{
                id: nonNull(intArg()),
                url: nonNull(stringArg()),
                description: stringArg()
            },

            resolve(parent, args, context) {
        //         const { id, description, url } = args;
        //         let link = links.find((link)=> link.id === id);
        //         if(!link){
        //             return null;
        //         }
        //         console.log(`description: ${description} \n url: ${url}`);
        //         link.description = description as string;
        //         link.url = url as string;

        //         return link
        //     }

                let update = context.prisma.link.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        description: args.description as string,
                        url: args.url as string
                    }
                })
                let updatedContent = context.prisma.link.findUnique({
                    where:{
                        id: args.id
                    }
                })

                return updatedContent
            }
                
        })
    }
})

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", {type: Sort});
        t.field("url", { type: Sort});
        t.field("createdAt", { type: Sort});
    },
})

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"]
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link });
        t.nonNull.int("count");
        t.id("id")
    },
})