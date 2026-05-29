import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCP7NLQDjNQSBTb_YagLsELoExdCrXNWpc",
  authDomain: "feraz-a5300.firebaseapp.com",
  projectId: "feraz-a5300",
  storageBucket: "feraz-a5300.firebasestorage.app",
  messagingSenderId: "1014848857624",
  appId: "1:1014848857624:web:4ddbc014a84b5db02a856d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const upsert = async (col, id, data) => {
  await setDoc(doc(db, col, String(id)), data, { merge: true });
};

export const remove = async (col, id) => {
  await deleteDoc(doc(db, col, String(id)));
};

export const useCollection = (col) => {
  const [data, setData] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, col), snap => {
      setData(snap.docs.map(d => ({ ...d.data(), _fid: d.id })));
      setReady(true);
    });
    return unsub;
  }, [col]);
  return [data, ready];
};
