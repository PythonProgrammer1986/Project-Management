import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Save user to db to track active users/names
        await setDoc(doc(db, 'users', currentUser.uid), {
          id: currentUser.uid,
          name: currentUser.displayName || 'Unknown User',
          email: currentUser.email,
          avatar: currentUser.photoURL,
          activeAt: serverTimestamp(),
        }, { merge: true });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signIn, signOut }}>
      {loading ? <div className="flex h-screen items-center justify-center">Loading...</div> : (user ? children : <LoginScreen signIn={signIn} />)}
    </FirebaseContext.Provider>
  );
}

function LoginScreen({ signIn }: { signIn: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Taskflow</h1>
          <p className="text-slate-500">Please sign in to continue</p>
        </div>
        <button
          onClick={signIn}
          className="w-full py-2.5 px-4 bg-[#f1c40f] hover:bg-[#d4ac0d] text-slate-900 font-medium rounded-lg transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
