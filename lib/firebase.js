import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIH1KmzqOdQee0d5UkWvH1PCFqfk35LKg",
  authDomain: "those-effing-smoothies.firebaseapp.com",
  databaseURL: "https://those-effing-smoothies.firebaseio.com",
  projectId: "those-effing-smoothies",
  storageBucket: "those-effing-smoothies.appspot.com",
  messagingSenderId: "326087528437",
  appId: "1:326087528437:web:810f4d34956b6235"
};

// For sign in with email - password
export const firebaseAuthConfig = {
  signInFlow: 'popup',
  // Auth providers
  // https://github.com/firebase/firebaseui-web#configure-oauth-providers
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: true,
    },
  ],
  signInSuccessUrl: '/',
  credentialHelper: 'none',
  callbacks: {
    // https://github.com/firebase/firebaseui-web#signinsuccesswithauthresultauthresult-redirecturl
    signInSuccessWithAuthResult: () =>
      // Don't automatically redirect. We handle redirects using
      // `next-firebase-auth`.
      false,
  },
}


/**
 * Ensure that we only initialize it once
 */
if(!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const increment = firebase.firestore.FieldValue.increment;

/// Helper functions

/**
 * Gets a users/{uid} document with username
 * @param {string} username
 */
export async function getUserWithUsername(username) {

  const userRef = firestore.collection('users');
  const query = userRef.where('username', '==', username).limit(1);
  const userDoc = (await query.get()).docs[0];
  return userDoc;

}

/**
 * Converts a firestore document to JSON
 * @param {DocumentSnapshot} doc
 * converts the timestamps from Firestore.Timestamp to normal number
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  }
}

export function userToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt?.toMillis() || 0,
  }
}