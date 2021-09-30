import { firestore, userToJSON, fromMillis } from "../lib/firebase";
import Loader from "../components/Loader";
import AuthCheck from "../components/AuthCheck";
import UserFeed from "../components/UserFeed";
import { useState, useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";


export default function SignupNotifs(props) {

  return (
    <AuthCheck admin>
      <main>
        <UserList />
      </main>
    </AuthCheck>
  )
}

function UserList() {
  const ref = firestore.collection('users');
  const query = ref.orderBy('createdAt', 'desc');

  const [querySnapshot, loading] = useCollection(query);
  const [users, setUsers] = useState([]);

  const newusers = [];

  if(querySnapshot) {
    querySnapshot.docChanges().forEach(change => {
      const thisuser = userToJSON(change.doc);
      if (change.type === 'added') {
        newusers.push(thisuser);
      }
    });
  }

  useEffect(() => {
    if(loading)
      return;
    setUsers(newusers.concat(users));
  }, [querySnapshot])

  if(loading)
    return null;

  return (
    <>
      <UserFeed users={users} />
    </>
  );
}