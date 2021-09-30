import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { firestore, getUserWithUsername, postToJSON, userToJSON } from "../../lib/firebase";

export async function getServerSideProps({ query }) {

  const { username } = query;
  const userDoc = userToJSON(await getUserWithUsername(username));
  const up = (await getUserWithUsername(username)).ref.path.split('/')[1];

  // SHort circuit to 404
  if(!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON
  let user = null;
  let posts = [];

  if(userDoc) {

    console.log("inside !");
    user = userDoc;

    const hearts = firestore
      .collectionGroup(`hearts`)
      .where('uid', '==', up.toString())
      .limit(5);

    let hearted = (await hearts.get()).docs.map(doc => doc.ref.path);
    hearted = hearted.map(p => {
      let fp = p.split("/");
      return fp[0] + "/" + fp[1] + "/" + fp[2] + "/" + fp[3];
    })
    console.log(hearted);

    for(const p of hearted) {
      const gpost = postToJSON(await firestore.doc(p).get());
      posts.push(gpost);
    }

    console.log(posts);

  }

  return {
    props: { user, posts },
  }
}

export default function UserPage({ user, posts }) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
