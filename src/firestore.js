import { doc,getDoc,collection,getDocs,query,where,orderBy } from "firebase/firestore";
import { db } from "./firebase";
export async function getUserProfile(uid){const s=await getDoc(doc(db,"users",uid));return s.exists()?{id:s.id,...s.data()}:null;}
export async function getProducts(){
  const q=query(collection(db,"products"),where("active","==",true),orderBy("name"));
  const s=await getDocs(q); return s.docs.map(x=>({id:x.id,...x.data()}));
}