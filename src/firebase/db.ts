import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { IPresetsProps } from '../types/types';

const firebaseConfig = {
  projectId: 'firstofficial3dscene',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

async function getPresetsFromFirestore() {
  const presetCol = collection(db, 'presets');
  const presetSnapshot = await getDocs(presetCol);
  const presetList = presetSnapshot.docs.map((doc) =>
    doc.data()
  ) as IPresetsProps[];
  return presetList;
}

export { getPresetsFromFirestore };
