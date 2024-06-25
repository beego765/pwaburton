// pages/registration.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { useTheme } from '../context/themeContext';

type FormField = {
  value: string;
  error: string | null;
};

type RegistrationFormState = {
  fullName: FormField;
  address: FormField;
  town: FormField;
  postCode: FormField;
  email: FormField;
  mobileNo: FormField;
  dateOfBirth: FormField;
  placeOfBirth: FormField;
  maritalStatus: FormField;
  sex: FormField;
  membershipInfo: string; // For storing dynamic membership information.
};

export default function RegistrationForm() {
  const theme = useTheme(); // This gets the current theme.
  const initialState: RegistrationFormState = {
    fullName: { value: '', error: null },
    address: { value: '', error: null },
    town: { value: '', error: null },
    postCode: { value: '', error: null },
    email: { value: '', error: null },
    mobileNo: { value: '', error: null },
    dateOfBirth: { value: '', error: null },
    placeOfBirth: { value: '', error: null },
    maritalStatus: { value: '', error: null },
    sex: { value: '', error: null },
    membershipInfo: '', // Initialize as empty, will be fetched from Firestore.
  };

  const [formState, setFormState] = useState<RegistrationFormState>(initialState);

  useEffect(() => {
    const fetchMembershipInfo = async () => {
      try {
        const q = query(collection(db, "membershipInfo"));
        const querySnapshot = await getDocs(q);
        const membershipData = querySnapshot.docs.map(doc => doc.data());
        // Assume there's a single document that contains membership information.
        if (membershipData.length > 0) {
          setFormState(prevState => ({ ...prevState, membershipInfo: membershipData[0].info }));
        }
      } catch (error) {
        console.error("Error fetching membership information: ", error);
      }
    };

    fetchMembershipInfo();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof RegistrationFormState) => {
    const value = e.target.value;
    const error = validateField(field, value);
    setFormState({ ...formState, [field]: { value, error } });
  };

  const validateField = (field: keyof RegistrationFormState, value: string): string | null => {
    if (!value.trim()) {
      return `${field} is required`;
    }
    // Add other field validations here as needed...
    return null;
  };

  const isFormValid = (): boolean => {
    return !Object.values(formState).some(field => typeof field !== 'string' && (field.error || !field.value.trim()));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      console.error('Form validation failed');
      alert('Please correct the errors before submitting the form.');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "registrations"), {
        fullName: formState.fullName.value,
        address: formState.address.value,
        town: formState.town.value,
        postCode: formState.postCode.value,
        email: formState.email.value,
        mobileNo: formState.mobileNo.value,
        dateOfBirth: formState.dateOfBirth.value,
        placeOfBirth: formState.placeOfBirth.value,
        maritalStatus: formState.maritalStatus.value,
        sex: formState.sex.value,
        timestamp: new Date(),
      });
      console.log("Registration submitted successfully!", docRef.id);
      alert("Registration submitted successfully!");
    } catch (error) {
      console.error("Error submitting registration: ", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4 space-y-6 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg">
      <h2 className="text-lg font-semibold">Registration Form</h2>
      {Object.keys(initialState).map((field) => (
        <div key={field} className="space-y-2">
          <label htmlFor={field} className="block font-medium">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</label>
          <input
            type="text"
            id={field}
            value={typeof formState[field as keyof RegistrationFormState] === 'string' ? formState[field as keyof RegistrationFormState] : (formState[field as keyof RegistrationFormState] as FormField).value}
            onChange={(e) => handleInputChange(e, field as keyof RegistrationFormState)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {(typeof formState[field as keyof RegistrationFormState] !== 'string') && formState[field as keyof RegistrationFormState] && (formState[field as keyof RegistrationFormState] as FormField).error && <span className="text-red-500 text-sm">{(formState[field as keyof RegistrationFormState] as FormField).error}</span>}
        </div>
      ))}



      {formState.membershipInfo && <div className="mt-4 text-gray-600 dark:text-gray-400"><strong>Membership Info:</strong> {formState.membershipInfo}</div>}
      <button
        type="submit"
        className={`py-2 px-4 ${theme.background}-500 ${theme.foreground}-200 rounded-lg shadow`}
        disabled={!isFormValid()}
      >
        Submit
      </button>
    </form>
  );
}