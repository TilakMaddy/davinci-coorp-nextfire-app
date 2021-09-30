import Link from 'next/link';
import { UserContext } from '../lib/context';
import { useContext } from 'react';
import { auth, firestore } from '../lib/firebase';
import { useDocument, useDocumentData } from 'react-firebase-hooks/firestore';

export default function Navbar() {

  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul style={{ padding: '20px'}}>
        <li>
          <Link href="/">
            <button className="btn-logo"> FEED </button>
          </Link>
        </li>

        {(username === "boss") &&  (
          <>

            <li className="push-left" style={{display: 'flex'}}>
              <Link href="/admin">
                <button className="btn-blue" style={{ fontSize: '16px'}}> Manage Posts 📝 </button>
              </Link>
              <Link href="/signup-notifs">
                <button className="btn-green" style={{ fontSize: '22px', boxSizing: 'border-box', position : 'relative'}}>
                  👽
                  <UserCount />
                </button>
              </Link>
              <button style={{ fontSize: '16px'}} onClick={() => auth.signOut()}>Sign Out</button>
            </li>

            <Link href={`/${username}`}>
              <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1573547429441-d7ef62e04b63?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGFub255bW91c3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80'} />
            </Link>

          </>
        )}

        {(username && username !== "boss") &&  (
          <>

            <Link href="/page-notifs">
              <button className="btn-blue push-left" style={{ fontSize: '22px', boxSizing: 'border-box', position : 'relative'}}>
                🔔
                <PageCount />
              </button>
            </Link>

            <li>
              <button onClick={() => auth.signOut()}>Sign Out</button>
            </li>

            <li>
              <Link href={`/${username}`}>
                <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1573547429441-d7ef62e04b63?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGFub255bW91c3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80'} />
              </Link>
            </li>

          </>
        )}


        {!username && (
          <>
            <li>
              <Link href="/enter">
                <button className="btn-blue"> {user ? 'Create Username' : 'Sign In'} </button>
              </Link>
            </li>

          </>
        )}

      </ul>
    </nav>
  )
}

/**
 * This component only shows up when boss is logged in
 */
function UserCount() {

  const ref = firestore.collection('other_stuff').doc('count');
  const [snapshot] = useDocument(ref);

  // window.s = snapshot;
  // console.log(snapshot?.data());

  return (
    <div className='user-count'
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        background: 'black',
        width: '30px',
        height: '30px',
        borderRadius: '50%'
      }}>

      { snapshot?.data().count }
    </div>
  );
}


/**
 * This component shows up for a normal user
 */

function PageCount() {

  const { user } = useContext(UserContext);

  // last_notif: Total notifications that exist in the table
  const last_notif_ref = firestore.doc('other_stuff/last_notif');
  const [last_notif, l1] = useDocumentData(last_notif_ref);

  const last_user_read = firestore.doc(`users/${user.uid}`);
  const [last_notif_read, l2] = useDocumentData(last_user_read);

  if(l1 || l2)
    return null;

  const new_count = last_notif.value - (last_notif_read?.last_read ?? 0);

  if(new_count == 0)
    return null;

  return <div className='page-count'
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        background: 'black',
        width: '30px',
        height: '30px',
        borderRadius: '50%'
      }}>

      { new_count }
  </div>;

}