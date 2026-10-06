import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
export async function registerUser(name,email,password){
  const c=await createUserWithEmailAndPassword(auth,email,password), u=c.user;
  await updateProfile(u,{displayName:name});
  await setDoc(doc(db,"users",u.uid),{uid:u.uid,name,email:u.email,role:"pembeli",balance:0,purchaseCount:0,createdAt:serverTimestamp()});
  return u;
}
export async function loginUser(email,password){return (await signInWithEmailAndPassword(auth,email,password)).user;}
export async function logoutUser(){await signOut(auth);}