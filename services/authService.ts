import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const signIn = (email: string, password: string): Promise<User> => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => userCredential.user);
};

export const signOut = (): Promise<void> => {
    return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
