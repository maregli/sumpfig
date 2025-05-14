// src/firebase/firestore.ts

import { collection, addDoc, getDocs, QuerySnapshot, DocumentData, onSnapshot, doc, deleteDoc, getDoc , setDoc, updateDoc, Timestamp } from 'firebase/firestore';

import { db } from 'firebaseServices/firebaseConfig';

import { Track } from 'types/track';
import { UserRole } from 'types/users';

import { validateUser } from 'utils/validators/userValidators';

// Reference to the 'tracks' collection in Firestore
const tracksCollectionRef = collection(db, 'tracks');
const usersCollectionRef = collection(db, 'users'); // Reference to the 'users' collection

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

export const getTrackFromId = async (trackId: string): Promise<Track | null> => {
  try {
    const trackDocRef = doc(db, 'tracks', trackId); // Reference to the specific document
    const trackDoc = await getDoc(trackDocRef); // Use getDoc to fetch a single document
    if (trackDoc.exists()) {
      const data = trackDoc.data();
      if (data) {
        return {
          id: trackDoc.id,
          ...(data as Omit<Track, 'id'>),
        };
      } else {
        console.warn('Track document is missing required fields');
        return null;
      }
    } else {
      console.log('No such document!');
      return null;
    }
  }
  catch (error) {
    console.error('Error getting track:', error);
    return null;
  }
};

export const getTracksFromIds = async (trackIds: readonly string[]): Promise<Track[]> => {
  try {
    const trackPromises = trackIds.map((id) => getTrackFromId(id));
    const tracks = await Promise.all(trackPromises);
    return tracks.filter((track) => track !== null) as Track[]; // Filter out null values
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

export const deleteTracks = async (trackIds: readonly string[]): Promise<void> => {
  try {
    // Use Promise.all to perform the deletions in parallel
    await Promise.all(
      trackIds.map(async (trackId) => {
        const trackDocRef = doc(db, 'tracks', trackId); // Reference to the specific document
        await deleteDoc(trackDocRef);
        console.log(`Track with ID ${trackId} deleted successfully.`);
      })
    );
    console.log('All selected tracks deleted successfully.');
  } catch (error) {
    console.error('Error deleting tracks:', error);
    throw error; // Re-throw the error to be handled by the component
  }
};

export const addUser = async (userData: UserRole): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userData.uid);
    const { uid, ...userDataWithoutId } = userData;

    // Use setDoc to write the data to the document
    await setDoc(docRef, userDataWithoutId); // Use merge to update the document if it exists

  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getUsers = async (): Promise<UserRole[]> => {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(usersCollectionRef);
    const users: UserRole[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<UserRole, 'id'>),
    }));
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const getUserFromId = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDocRef = doc(db, 'users', userId); // Reference to the specific document
    const userDoc = await getDoc(userDocRef); // Use getDoc to fetch a single document
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data && validateUser(data)
      ) {
        return {
          uid: userDoc.id,
          displayName: data.displayName,
          email: data.email,
          role: data.role,
        };
      } else {
        console.warn('User document is missing required fields');
        return null;
      }
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getDisplayNameFromUserId = async (userId: string): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return typeof data.displayName === 'string' ? data.displayName : 'Anonymous';
    } else {
      console.warn(`User not found for UID: ${userId}`);
      return 'Anonymous';
    }
  } catch (error) {
    console.error(`Error fetching display name for UID ${userId}:`, error);
    return 'Anonymous';
  }
};

// Function to submit or update a rating for a track
export const submitRating = async (trackId: string, userId: string, rating: number): Promise<void> => {
  try {
    // Reference to the track's ratings subcollection
    const trackDocRef = doc(db, 'tracks', trackId);
    const ratingsCollectionRef = collection(trackDocRef, 'ratings');

    // Check if the user has already rated the track
    const userRatingDocRef = doc(ratingsCollectionRef, userId);
    const userRatingDoc = await getDoc(userRatingDocRef);

    if (userRatingDoc.exists()) {
      // If the user has already rated, update the rating
      await updateDoc(userRatingDocRef, {
        rating: rating, // Update the rating field with the new rating
      });
      console.log(`Updated rating for track ${trackId} by user ${userId}`);
    } else {
      // If the user hasn't rated, create a new document with the rating
      await setDoc(userRatingDocRef, {
        rating: rating, // Store the user's rating
      });
      console.log(`Submitted rating for track ${trackId} by user ${userId}`);
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
  }
};

export const getRating = async (trackId: string, userId: string): Promise<number | null> => {
  try {
    // Reference to the track's ratings subcollection
    const trackDocRef = doc(db, 'tracks', trackId);
    const ratingsCollectionRef = collection(trackDocRef, 'ratings');

    // Get the user's rating document
    const userRatingDocRef = doc(ratingsCollectionRef, userId);
    const userRatingDoc = await getDoc(userRatingDocRef);

    if (userRatingDoc.exists()) {
      const data = userRatingDoc.data();
      return data.rating as number; // Return the rating value
    } else {
      console.log(`No rating found for track ${trackId} by user ${userId}`);
      return null;
    }
  }
  catch (error) {
    console.error('Error getting rating:', error);
    return null;
  }
}

export const getAverageRating = async (trackId: string): Promise<number | null> => {
  try {
    // Reference to the track's ratings subcollection
    const trackDocRef = doc(db, 'tracks', trackId);
    const ratingsCollectionRef = collection(trackDocRef, 'ratings');

    // Get all ratings for the track
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(ratingsCollectionRef);
    const ratings: number[] = querySnapshot.docs.map((doc) => doc.data().rating as number);

    if (ratings.length === 0) {
      console.log(`No ratings found for track ${trackId}`);
      return null;
    }

    // Calculate the average rating
    const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
    return totalRating / ratings.length;
  }
  catch (error) {
    console.error('Error getting average rating:', error);
    return null;
  }
}

export const subscribeToAverageRating = (
  trackId: string,
  onAverageChange: (trackId: string, avg: number | null) => void
): (() => void) => {
  const ratingsRef = collection(doc(db, 'tracks', trackId), 'ratings');

  const unsubscribe = onSnapshot(ratingsRef, (snapshot) => {
    const ratings: number[] = snapshot.docs.map(doc => doc.data().rating as number);

    if (ratings.length === 0) {
      onAverageChange(trackId, null);
    } else {
      const avg = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
      onAverageChange(trackId, avg);
    }
  });

  return unsubscribe;
};


export const postComment = async (trackId: string, userId: string, comment: string): Promise<void> => {
  try {
    // Reference to the track's comments subcollection
    const trackDocRef = doc(db, 'tracks', trackId);
    const commentsCollectionRef = collection(trackDocRef, 'comments');

    // Create a new comment document
    await addDoc(commentsCollectionRef, {
      author: userId,
      text: comment,
      timestamp: new Date(),
    });
    console.log(`Comment added for track ${trackId} by user ${userId}`);
  } catch (error) {
    console.error('Error posting comment:', error);
  }
}

interface TrackComment {
  id?: string;
  text: string;
  author: string;
  timestamp: Date;
}

export const getComments = async (trackId: string): Promise<TrackComment[]> => {
  try {
    const trackDocRef = doc(db, 'tracks', trackId);
    const commentsCollectionRef = collection(trackDocRef, 'comments');

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(commentsCollectionRef);
    const comments: TrackComment[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TrackComment, 'id'>),
      timestamp: (doc.data().timestamp as Timestamp).toDate(), // convert Firestore Timestamp to Date
    }));
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};
