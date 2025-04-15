// src/firebase/firestore.ts

import { collection, addDoc, getDocs, QuerySnapshot, DocumentData , onSnapshot} from 'firebase/firestore';
import { db } from 'firebaseServices/firebaseConfig';

import { Track } from 'types/track';

// Reference to the 'tracks' collection in Firestore
const tracksCollectionRef = collection(db, 'tracks');

// Function to add a track
export const addTrack = async (trackData: Omit<Track, 'id'>): Promise<void> => {
  try {
    const docRef = await addDoc(tracksCollectionRef, trackData);
    console.log('Track added with ID:', docRef.id);
  } catch (e) {
    console.error('Error adding track:', e);
  }
};

// Function to get all tracks
export const getTracks = async (): Promise<Track[]> => {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(tracksCollectionRef);
    const tracks: Track[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Track, 'id'>),
    }));
    return tracks;
  } catch (error) {
    console.error('Error getting tracks:', error);
    return [];
  }
};

// Function to get all tracks with real-time updates
export const subscribeToTracks = (
  setTracks: (tracks: Track[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void // Added error state
): () => void => {
  setIsLoading(true);
  setError(null); // Clear any previous errors

  const unsubscribe = onSnapshot(
    tracksCollectionRef,
    (snapshot) => {
      const tracks: Track[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Track, 'id'>),
      }));
      setTracks(tracks);
      setIsLoading(false);
    },
    (error) => {
      console.error("Error getting tracks:", error);
      setError(error); // Set the error state
      setIsLoading(false);
    }
  );

  return () => unsubscribe();
};
