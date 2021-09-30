import Link from 'next/link';
import { UserContext } from '../lib/context';
import { useContext, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase';
import { useCollection, useCollectionData, useDocument, useDocumentData } from 'react-firebase-hooks/firestore';
import PubFeed from '../components/PubFeed';

export default function NewlyRevisedPages() {

  const {user, username} = useContext(UserContext);

  console.log({user});

  // last_notif: Total notifications that exist in the table
  const last_notif_ref = firestore.doc('other_stuff/last_notif');
  const [last_notif, l1] = useDocumentData(last_notif_ref);

  useEffect(() => {

    if(l1) return;

    const last_user_read = firestore.doc(`users/${user.uid}`);
    last_user_read.update({
      last_read: last_notif.value
    })

  }, [last_notif])

  const publications_ref = firestore.collection(`user_notifs`);
  const [pubs, l2] = useCollectionData(publications_ref);

  if(l2) return null;

  return <PubFeed posts={pubs} />

}