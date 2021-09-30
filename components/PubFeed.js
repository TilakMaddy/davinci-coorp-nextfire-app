import Link from "next/link";

export default function PubFeed({ posts }) {

  if(!posts) {
    return null;
  }

  return [...posts].reverse().map((post, i) => <PostItem post={post} key={i} />) || null;
}

function PostItem({ post }) {

  return (
    <div className='card' style={{maxWidth: '75%', margin: '0 auto 16px'}}>
      <Link href={`/boss/${post.slug}`}>
        <h2>
          <a> {post.content} </a>
        </h2>
      </Link>
    </div>
  );

}