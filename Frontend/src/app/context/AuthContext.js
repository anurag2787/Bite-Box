'use client';
import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  getIdToken // Add this import
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';  // Assuming you're using Axios to make requests

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-In Successful", result.user);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const emailSignUp = async (email, password, displayName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed up:", user);

      await updateProfile(userCredential.user, { displayName });
      setUser({ ...userCredential.user, displayName });
      router.push('/');
    } catch (error) {
      console.error("Error signing up with email and password: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const emailSignIn = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed in:", user);

      router.push('/');
    } catch (error) {
      console.error("Error signing in with email and password: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to retrieve the Firebase token
  const getAuthToken = async () => {
    if (user) {
      try {
        const token = await getIdToken(user); // Get the Firebase ID token
        return token;
      } catch (error) {
        console.error("Error getting Firebase token: ", error);
        throw error;
      }
    }
    return null;
  };

  // Example of making a request with the token (for example, posting a recipe)
  const postRecipeWithToken = async (recipeData) => {
    const token = await getAuthToken();
    if (token) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/recipes`, recipeData, {
          headers: {
            Authorization: `Bearer ${token}`,  // Send the token in the header
          },
        });
      } catch (error) {
        console.error("Error posting recipe: ", error);
        throw error;
      }
    } else {
      console.error("No valid token found");
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      googleSignIn, 
      emailSignUp, 
      emailSignIn, 
      logOut, 
      loading,
      postRecipeWithToken,  
      getAuthToken, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
