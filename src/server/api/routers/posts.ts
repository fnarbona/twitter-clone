import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = await clerkClient.users
      .getUserList({
        userId: posts.map((post) => post.userId),
        limit: 100,
      })
      .then((userList) => userList.map(filterUserForClient));

    return posts.map((post) => ({
      post,
      author: users.find((user) => user.id === post.userId),
    }));
  }),
});
