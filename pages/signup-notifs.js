import { firestore, userToJSON, fromMillis } from "../lib/firebase";
import Loader from "../components/Loader";
import AuthCheck from "../components/AuthCheck";
import UserFeed from "../components/UserFeed";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";


// Max posts to query per page
const LIMIT = 5;

export async function getServerSideProps() {

  const usersQuery = firestore
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);

  const users = (await usersQuery.get()).docs?.map(doc => userToJSON(doc));

  return {
    props: { users },
  }

}

export default function SignupNotifs(props) {

  const [users, setusers] = useState(props.users);
  const [loading, setLoading] = useState(false);
  const [usersEnd, setusersEnd] = useState(false);

  const getMoreusers = async () => {

    if(users.length == 0) {
      setusersEnd(true);
      return;
    }

    setLoading(true);

    const lastUser = users[users.length - 1];

    /**
     * createdAt is a Firestore.Timestamp
     *  - if we fetched the last post from client side
     *
     * createdAt is a number
     * - if we fetched the last post from server side (cuz it got 'postToJSON'ed - serialized)
     *
     * cursor is the Firestore.Timestampof the last document
     */
    const cursor = typeof lastUser.createdAt === 'number' ?
      fromMillis(lastUser.createdAt) : lastUser.createdAt;

    const query = firestore
      .collection('users')
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)

    const newusers = (await query.get()).docs.map((doc) => userToJSON(doc));

    setusers(users.concat(newusers));
    setLoading(false);

    if(newusers.length < LIMIT) {
      setusersEnd(true);
    }

  };

  return (
    <AuthCheck admin>

      <main>
        <UserList existingUsers={users} />
        <UserFeed users={users} />
        {!loading && !usersEnd && <button onClick={getMoreusers }> Load More </button>}
        {loading && <Loader show />}
        {usersEnd && 'You have reached the end of users !'}
      </main>

    </AuthCheck>
  )
}

function UserList({ existingUsers }) {
  const ref = firestore.collection('users');
  const query = ref.orderBy('createdAt', 'desc');
  const [querySnapshot, loading] = useCollection(query);

  if(loading)
    return null;

  if(querySnapshot.metadata.fromCache)
    return null;

  const users = [];

  querySnapshot.docChanges().forEach(change => {

    const thisuser = userToJSON(change.doc);
    // console.log(thisuser, existingUsers);


    if (change.type === 'added' && !existingUsers.includes(userToJSON(change.doc))) {
      users.push(userToJSON(change.doc));
    }

  });

  return (
    <>
      <UserFeed users={users} admin />
    </>
  );
}