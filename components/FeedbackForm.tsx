import React, { useState } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import logger from '../utils/logger';

export const FeedbackForm = ({ path }: { path: string }) => {
  const [feedback, setFeedback] = useState('');
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      logger.warn("Empty feedback submitted, operation cancelled.");
      return;
    }
    try {
      await addDoc(collection(db, "userFeedbacks"), {
        path,
        feedback,
        timestamp: new Date()
      });
      logger.info(`Feedback submitted successfully for path: ${path}`);
      alert('Feedback submitted successfully!');
      setFeedback('');
    } catch (error: any) {
      logger.error("Error submitting feedback:", error.message, error.stack);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Describe your issue or share your thoughts"
        className="border rounded p-2 w-full"
      />
      <button
        onClick={submitFeedback}
        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Submit Feedback
      </button>
    </div>
  );
};