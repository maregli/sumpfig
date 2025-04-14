// src/firebase/firestore.js

import { collection, addDoc } from 'firebase/firestore';
import { db } from 'firebaseServices/firebaseConfig';

const songsCollectionRef = collection(db, 'sets');  // 'songs' collection

// Function to add a song
export const addSong = async (songData) => {
  try {
    const docRef = await addDoc(songsCollectionRef, songData);
    console.log("Song added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding song: ", e);
  }
};