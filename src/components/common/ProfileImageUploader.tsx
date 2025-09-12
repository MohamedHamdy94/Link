'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { uploadDriverPhoto, uploadOwnerPhoto, deleteFileByUrl } from '@/lib/firebase/storage';
import { updateDriverAction } from '@/app/driver/actions';
import { updateEquipmentOwnerAction } from '@/app/equipment-owner/actions';

interface ProfileImageUploaderProps {
  currentPhotoUrl?: string | null;
  userType: 'drivers' | 'equipmentOwners';
  userId: string;
  onPhotoUpdate: (newUrl: string | null) => void;
}

const ProfileImageUploader = ({
  currentPhotoUrl,
  userType,
  userId,
  onPhotoUpdate,
}: ProfileImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup effect for the preview URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create and set a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setLoading(true);
    setError(null);

    try {
      let newPhotoUrl = '';
      let uploadResult;

      if (userType === 'drivers') {
        uploadResult = await uploadDriverPhoto(userId, file);
      } else {
        uploadResult = await uploadOwnerPhoto(userId, file);
      }

      if (uploadResult.success && uploadResult.url) {
        newPhotoUrl = uploadResult.url;

        // Delete old photo if it exists and is different
        if (currentPhotoUrl && currentPhotoUrl !== newPhotoUrl) {
          await deleteFileByUrl(currentPhotoUrl);
        }

        // Update photoUrl in Firestore
        if (userType === 'drivers') {
          await updateDriverAction(userId, { photoUrl: newPhotoUrl });
        } else {
          await updateEquipmentOwnerAction(userId, { photoUrl: newPhotoUrl });
        }

        onPhotoUpdate(newPhotoUrl);
        window.location.reload(); // Hard refresh the page
      } else {
        throw new Error(uploadResult.error || 'فشل في رفع الصورة.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الصورة.');
      console.error('Error uploading photo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-32 h-32 rounded-full overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="text-white text-sm mt-2">جاري تحميل الصورة...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 text-white text-xs text-center p-1 z-10">
          {error}
        </div>
      )}
      <Image
        key={previewUrl || currentPhotoUrl} // Add key to force re-render
        src={previewUrl || currentPhotoUrl || '/images/imagesProfile.jpg'}
        alt="صورة الملف الشخصي"
        layout="fill"
        objectFit="cover"
        className="transition-opacity duration-300 group-hover:opacity-75"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <Camera size={32} className="text-white" />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={loading}
      />
    </div>
  );
};

export default ProfileImageUploader;