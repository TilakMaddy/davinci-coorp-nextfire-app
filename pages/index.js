import { firestore, postToJSON, fromMillis } from "../lib/firebase";
import Loader from "../components/Loader";
import PostFeed from "../components/PostFeed";
import { useState } from "react";

// Max posts to query per page
const LIMIT = 4;

export async function getServerSideProps(context) {

  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts },
  }

}

export default function HomePage(props) {

  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {

    if(posts.length == 0) {
      setPostsEnd(true);
      return;
    }

    setLoading(true);

    const lastPost = posts[posts.length - 1];

    /**
     * createdAt is a Firestore.Timestamp
     *  - if we fetched the last post from client side
     *
     * createdAt is a number
     * - if we fetched the last post from server side (cuz it got 'postToJSON'ed - serialized)
     *
     * cursor is the Firestore.Timestampof the last document
     */
    const cursor = typeof lastPost.createdAt === 'number' ?
      fromMillis(lastPost.createdAt) : lastPost.createdAt;

    const query = firestore
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if(newPosts.length < LIMIT) {
      setPostsEnd(true);
    }

  };

  return (
    <main>
      <PostFeed posts={posts} />
      {!loading && !postsEnd && <button onClick={getMorePosts }> Load More </button>}
      {loading && <Loader show />}
      {postsEnd && 'You have reached the end of posts !'}
    </main>
  )
}

