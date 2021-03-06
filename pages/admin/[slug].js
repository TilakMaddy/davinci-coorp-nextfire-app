import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';
import ImageUploader from '../../components/ImageUploader';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce, useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';


export default function AdminPostEdit(props) {
  return (
    <AuthCheck admin>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {

  const last_notif_ref = firestore.doc('other_stuff/last_notif');
  const [last_notif] = useDocumentData(last_notif_ref);

  const { register, errors, handleSubmit, formState, reset, watch } = useForm({ defaultValues, mode: 'onChange' });
  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {

    const userNotifsRef = firestore.doc(`user_notifs/${last_notif.value + 1}`);

    const batch = firestore.batch();

    batch.update(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    /**
     * notify the users if Boss decides to pub/unpub the page
     */
    // console.log(published, typeof published);
    const notifContent = published ? `Post on ${defaultValues.title} just got updated ! ` : `Post on ${defaultValues.title} was unpublished ! `;
    // console.log(notifContent);

    batch.set(userNotifsRef, {
      content: notifContent,
      slug: defaultValues.slug,
      createdAt: serverTimestamp(),
    });

    batch.update(last_notif_ref, {
      value: last_notif.value + 1
    });

    try {
      batch.commit();
      reset({ content, published });
      toast.success('Post updated successfully!');
    } catch(e) {
      toast.error('An error occured !');
    }

  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
          name="content"
          ref={register({
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} name="published" type="checkbox" ref={register} />
          <label>Published (Notifies all users if ticked) </label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await postRef.delete();
      router.push('/admin');
      toast('Post annihilated ', { icon: '???????' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}