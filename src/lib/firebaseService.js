import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const REPORTS_COLLECTION = 'reports';

// Subscribe to real-time updates
export const subscribeToReports = (callback) => {
    const q = query(collection(db, REPORTS_COLLECTION));

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(reports);
    }, (error) => {
        console.error('Firestore subscription error:', error);
        callback([]);
    });
};

// Add a new report
export const addReport = async (reportData) => {
    try {
        const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
            ...reportData,
            createdAt: serverTimestamp(),
            history: reportData.history || []
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding report:', error);
        throw error;
    }
};

// Update report status
export const updateReportStatus = async (reportId, newStatus) => {
    try {
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
};

// Update report details
export const updateReport = async (reportId, updates) => {
    try {
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
};

// Add comment to history
export const addCommentToReport = async (reportId, currentHistory, newComment) => {
    try {
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            history: [...currentHistory, newComment],
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

// Upload image to Firebase Storage
export const uploadImage = async (file, reportId) => {
    console.log('uploadImage called with:', file.name, file.type, file.size);
    try {
        const timestamp = Date.now();
        const fileName = `${reportId}_${timestamp}_${file.name}`;
        const storageRef = ref(storage, `reports/${fileName}`);
        console.log('Created storage ref:', storageRef.fullPath);

        console.log('Starting uploadBytes...');
        // Add a timeout to the upload
        const uploadPromise = uploadBytes(storageRef, file);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timed out')), 60000)
        );

        const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
        console.log('uploadBytes completed:', snapshot);

        console.log('Getting download URL...');
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Got download URL:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

// Delete a report
export const deleteReport = async (reportId) => {
    try {
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await deleteDoc(reportRef);
    } catch (error) {
        console.error('Error deleting report:', error);
        throw error;
    }
};
