// Firebase Storage utility functions
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Folder paths
const DRIVER_PHOTOS_PATH = 'driver-photos';
const EQUIPMENT_PHOTOS_PATH = 'equipment-photos';

/**
 * Upload a driver photo to Firebase Storage
 * @param driverId - The ID of the driver
 * @param file - The file to upload
 * @returns Object with success status and download URL or error
 */
export const uploadDriverPhoto = async (driverId: string, file: File) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${driverId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${DRIVER_PHOTOS_PATH}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading driver photo:', error);
    return { success: false, error };
  }
};

/**
 * Upload an equipment photo to Firebase Storage
 * @param ownerId - The ID of the equipment owner
 * @param equipmentId - The ID of the equipment
 * @param file - The file to upload
 * @returns Object with success status and download URL or error
 */
export const uploadEquipmentPhoto = async (ownerId: string, equipmentId: string, file: File) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${ownerId}_${equipmentId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${EQUIPMENT_PHOTOS_PATH}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading equipment photo:', error);
    return { success: false, error };
  }
};

/**
 * Delete a file from Firebase Storage by URL
 * @param url - The download URL of the file to delete
 * @returns Object with success status or error
 */
export const deleteFileByUrl = async (url: string) => {
  try {
    // Extract the path from the URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
};

/**
 * Helper function to convert a File object to a base64 string
 * Useful for previewing images before upload
 * @param file - The file to convert
 * @returns Promise with the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
