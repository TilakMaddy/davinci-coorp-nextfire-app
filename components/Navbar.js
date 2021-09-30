import Link from 'next/link';
import { UserContext } from '../lib/context';
import { useContext } from 'react';
import { auth } from '../lib/firebase';

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
                <button className="btn-green" style={{ fontSize: '22px', boxSizing: 'border-box'}}> 🔔 </button>
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

            <li className="push-left">
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
