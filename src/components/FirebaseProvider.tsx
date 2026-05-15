import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, signOut as fbSignOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  changePassword: async () => {},
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let name = currentUser.displayName;
        if (!name && currentUser.email) {
          name = currentUser.email.split('@')[0];
        }
        // Save user to db to track active users/names
        await setDoc(doc(db, 'users', currentUser.uid), {
          id: currentUser.uid,
          name: name || 'Unknown User',
          email: currentUser.email,
          avatar: currentUser.photoURL || '',
          activeAt: serverTimestamp(),
        }, { merge: true });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const changePassword = async (newPassword: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signOut, changePassword }}>
      {loading ? <div className="flex h-screen items-center justify-center">Loading...</div> : (user ? children : <LoginScreen />)}
    </FirebaseContext.Provider>
  );
}

function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = `${username.toLowerCase()}@taskflow.local`;

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          // If admin does not exist, auto-create it
          if (username.toLowerCase() === 'admin' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
            try {
               await createUserWithEmailAndPassword(auth, email, password);
               return; // Created and signed in
            } catch (createErr: any) {
               if (createErr.code !== 'auth/email-already-in-use') {
                 throw createErr;
               }
            }
          }
          throw err;
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setError('Invalid credentials.');
      else if (err.code === 'auth/user-not-found') setError('User not found.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/email-already-in-use') setError('User ID already exists.');
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else if (err.code === 'auth/operation-not-allowed') setError('Email/Password login is not enabled. Please enable "Email/Password" in the Firebase Console under Authentication > Sign-in method.');
      else setError('Authentication error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Taskflow</h1>
          <p className="text-slate-500">{isSignUp ? 'Create a new account' : 'Please sign in to continue'}</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c40f]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c40f]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#f1c40f] hover:bg-[#d4ac0d] disabled:opacity-50 text-slate-900 font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-900 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
