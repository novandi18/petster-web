"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Response } from "@/types/interfaces/Response";
import { Shelter } from "@/types/interfaces/Shelter";
import { UserType } from "@/types/enums/userType";
import { UserResult } from "@/types/interfaces/UserResult";
import { Volunteer } from "@/types/interfaces/Volunteer";

interface AuthContextValue {
  user: UserResult | null;
  loading: boolean;
  register: (payload: RegisterPayload) => Promise<Response<void>>;
  login: (email: string, password: string) => Promise<Response<void>>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<Response<void>>;
  changeEmail: (payload: ChangeEmailPayload) => Promise<Response<void>>;
  reauthenticate: (password: string) => Promise<Response<void>>;
  logout: () => Promise<void>;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  userType: UserType.VOLUNTEER | UserType.SHELTER;
}

type UpdateProfilePayload = {
  name: string;
  phoneNumber: string;
  address: string;
};

type ChangeEmailPayload = {
  newEmail: string;
  currentPassword: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userResult = await fetchUserData(firebaseUser);
        setUser(userResult);
        localStorage.setItem("user", JSON.stringify(userResult));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (
    firebaseUser: FirebaseUser,
  ): Promise<UserResult | null> => {
    const collections = ["volunteers", "shelters"];
    for (const col of collections) {
      const snapshot = await getDoc(doc(db, col, firebaseUser.uid));
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          type: col === "volunteers" ? UserType.VOLUNTEER : UserType.SHELTER,
          data: { id: firebaseUser.uid, ...data } as unknown as
            | Volunteer
            | Shelter,
        };
      }
    }
    return null;
  };

  const register = async (
    payload: RegisterPayload,
  ): Promise<Response<void>> => {
    try {
      const { email, password, name, phoneNumber, address, userType } = payload;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const ref = doc(
        db,
        userType === UserType.VOLUNTEER ? "volunteers" : "shelters",
        uid,
      );
      await setDoc(ref, { name, email, phoneNumber, address });

      return Response.Success(undefined);
    } catch (error: unknown) {
      return Response.Error(getErrorMessage(error));
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<Response<void>> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return Response.Success(undefined);
    } catch (error: unknown) {
      return Response.Error(getErrorMessage(error));
    }
  };

  const updateProfile = async (
    payload: UpdateProfilePayload,
  ): Promise<Response<void>> => {
    try {
      if (!user) return Response.Error("User not logged in");

      const col = user.type === UserType.VOLUNTEER ? "volunteers" : "shelters";

      await updateDoc(doc(db, col, String(user.data.id)), {
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
      });

      setUser({
        ...user,
        data: {
          ...user.data,
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          address: payload.address,
        },
      });

      return Response.Success(undefined);
    } catch (error: unknown) {
      return Response.Error(getErrorMessage(error));
    }
  };

  const changeEmail = async (payload: {
    newEmail: string;
  }): Promise<Response<void>> => {
    try {
      if (!auth.currentUser || !user) {
        return Response.Error("User not logged in");
      }
      const actionCodeSettings = {
        url: `${window.location.origin}?emailChanged=true`,
        handleCodeInApp: true,
      };
      await verifyBeforeUpdateEmail(
        auth.currentUser,
        payload.newEmail,
        actionCodeSettings,
      );

      const col = user.type === UserType.VOLUNTEER ? "volunteers" : "shelters";
      await updateDoc(doc(db, col, String(user.data.id)), {
        email: payload.newEmail,
      });

      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
      return Response.Success(undefined);
    } catch (error: unknown) {
      return Response.Error(getErrorMessage(error));
    }
  };

  const reauthenticate = async (password: string): Promise<Response<void>> => {
    if (!auth.currentUser) {
      return Response.Error("User not logged in");
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        password,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      return Response.Success(undefined);
    } catch (error: unknown) {
      return Response.Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateProfile,
        changeEmail,
        reauthenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used inside AuthProvider");
  return context;
};
