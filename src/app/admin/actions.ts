'use server';

import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getSession } from '@/lib/firebase/auth'; // Assuming getSession is a server-side function

interface UpdateSecretNumberResult {
  success: boolean;
  message: string;
}

export async function updateSecretNumber(
  userType: 'drivers' | 'equipmentOwners',
  userId: string,
  newSecretNumber: string
): Promise<UpdateSecretNumberResult> {
  try {
    const session = getSession();

    // 1. Authentication and Authorization Check
    if (!session || session.userType !== 'admins') {
      return { success: false, message: 'Unauthorized: Only admins can perform this action.' };
    }

    // 2. Input Validation
    if (!userId || !newSecretNumber) {
      return { success: false, message: 'User ID and Secret Number cannot be empty.' };
    }

    // Basic validation for secret number (adjust as needed)
    if (newSecretNumber.length < 4 || newSecretNumber.length > 20) {
      return { success: false, message: 'Secret Number must be between 4 and 20 characters.' };
    }

    const collectionName = userType === 'drivers' ? 'drivers' : 'equipmentOwners';
    const userRef = doc(db, collectionName, userId);

    // Verify user exists before updating
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return { success: false, message: `User with ID ${userId} not found in ${collectionName} collection.` };
    }

    // 3. Update Firestore Document
    await updateDoc(userRef, {
      secretNumber: newSecretNumber,
      updatedAt: new Date(),
    });

    return { success: true, message: `Secret number for ${userType} ${userId} updated successfully.` };
  } catch (error) {
    console.error('Error updating secret number:', error);
    return { success: false, message: 'An unexpected error occurred while updating the secret number.' };
  }
}
