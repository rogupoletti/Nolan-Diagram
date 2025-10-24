import { QuizQuestion, Submission } from '../types';
import { db } from './firebase';
import { 
  collection, addDoc, getDocs, getDoc, doc, 
  query, orderBy, Timestamp, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { INITIAL_QUIZ_QUESTIONS } from '../constants';

const SUBMISSIONS_COLLECTION = 'submissions';
const QUESTIONS_COLLECTION = 'questions';
const ADMINS_COLLECTION = 'admins';

export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    const submissions: Submission[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        userData: data.userData,
        answers: data.answers,
        results: {
          economic: data.results.economic,
          personal: data.results.personal,
          // Handle legacy data if 'category' exists, otherwise use 'categoryKey'
          categoryKey: data.results.categoryKey || data.results.category || 'centrist',
        },
        timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
      });
    });
    return submissions;
  } catch (error) {
    console.error("Failed to fetch submissions from Firestore", error);
    return [];
  }
};

export const saveSubmission = async (submission: Omit<Submission, 'id'>): Promise<void> => {
  try {
    const submissionWithTimestamp = {
      ...submission,
      timestamp: Timestamp.fromDate(new Date(submission.timestamp)),
    };
    await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionWithTimestamp);
  } catch (error) {
    console.error("Failed to save submission to Firestore", error);
  }
};

export const getQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    const q = query(collection(db, QUESTIONS_COLLECTION), orderBy('text.en'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No questions found. Seeding database with initial questions...");
      // The database is empty, so let's add the initial questions.
      const seedPromises = INITIAL_QUIZ_QUESTIONS.map(question => {
        const { id, ...questionData } = question; // Firestore generates its own ID
        return addDoc(collection(db, QUESTIONS_COLLECTION), questionData);
      });
      await Promise.all(seedPromises);
      console.log("Database seeded successfully.");
      // Return the initial questions directly so the UI can render immediately.
      // The IDs won't match firestore yet, but it's fine for the first run.
      // The next time getQuestions is called, it will pull from firestore with correct IDs.
      return INITIAL_QUIZ_QUESTIONS;
    }
    
    const questions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        text: data.text,
        type: data.type,
        weight: data.weight,
      });
    });
    return questions;
  } catch (error) {
    console.error("Failed to fetch questions from Firestore", error);
    return [];
  }
};

export const addQuestion = async (question: Omit<QuizQuestion, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), question);
    return docRef.id;
  } catch (error) {
    console.error("Failed to add question to Firestore", error);
    throw error;
  }
};

export const updateQuestion = async (question: QuizQuestion): Promise<void> => {
  try {
    const { id, ...data } = question;
    const questionRef = doc(db, QUESTIONS_COLLECTION, id);
    await updateDoc(questionRef, data);
  } catch (error) {
    console.error("Failed to update question in Firestore", error);
    throw error;
  }
};

export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, id));
  } catch (error)
 {
    console.error("Failed to delete question from Firestore", error);
    throw error;
  }
};

export const isAdmin = async (uid: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    return adminDoc.exists();
  } catch (error) {
    console.error("Failed to check admin status", error);
    return false;
  }
};