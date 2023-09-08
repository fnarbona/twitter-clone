// next
import Head from "next/head";
import Image from "next/image";

// components
import LoadingPage from "~/components/Loading";
import { SignInButton, useUser } from "@clerk/nextjs";

// utils
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs, api } from "~/utils/api";
import { useState } from "react";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-4 border-b-2 border-slate-500 p-4">
      <Image
        src={author.imageUrl}
        className="rounded-full"
        width={48}
        height={48}
        alt={`${author.username}'s profile picture`}
      />
      <div>
        <div className="flex gap-1 text-slate-500">
          <span>{`@${author?.username}`}</span>
          <span>-</span>
          <span>{`${dayjs(post?.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-white">{post.content}</span>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const [post, setPost] = useState("");

  const { user } = useUser();
  if (!user) return null;

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setPost("");
      void ctx.posts.getAll.invalidate();
    },
  });

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.imageUrl}
        className="rounded-full"
        width={48}
        height={48}
        alt="Profile image"
      />
      <input
        placeholder="Type some emojis!"
        className="grow rounded-md bg-transparent p-2 text-white outline-none"
        value={post}
        onChange={(e) => setPost(e.target.value)}
      />
      <button
        className="mb-2 mr-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        onClick={() => mutate({ content: post })}
        disabled={isPosting}
      >
        Post
      </button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  return (
    <div className="w-full">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // fetch is cached, so we don't need to capture it for Feed component
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-500 md:max-w-2xl">
          <div className="flex border-b border-slate-500 p-4">
            {!isSignedIn && <SignInButton />}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
