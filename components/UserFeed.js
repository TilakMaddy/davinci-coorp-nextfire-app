import Link from "next/link";

export default function UsersFeed({ users }) {
  return users?.map((user, i) => <UserItem user={user} key={i} />) || null;
}

function UserItem({ user }) {

  return (
    <div className='card'>
      <Link href={`/${user.username}`}>
        <h2>
          <a> <i> @{user.username} </i> {user.displayName}  created an account on {new Date(user.createdAt).toLocaleDateString()} !</a>
        </h2>
      </Link>
    </div>
  );

}