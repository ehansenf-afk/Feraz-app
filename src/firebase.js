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
  try { await setDoc(doc(db, col, String(id)), data, { merge: true }); } catch(e) { console.error(e); }
};

export const remove = async (col, id) => {
  try { await deleteDoc(doc(db, col, String(id))); } catch(e) { console.error(e); }
};

// Arranca INMEDIATAMENTE con datos locales, sincroniza en segundo plano
export const useCollection = (col, seedData = []) => {
  const [data, setData] = useState(seedData);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, col),
        (snap) => {
          if (snap.docs.length > 0) {
            setData(snap.docs.map(d => ({ ...d.data(), _fid: d.id })));
          }
        },
        (err) => console.error(`Firebase ${col}:`, err)
      );
      return unsub;
    } catch(e) {
      console.error(e);
    }
  }, [col]);

  return data;
};
