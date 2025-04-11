// تعريف نوع بيانات السائق
export interface Driver {
  id?: string;
  name: string;
  age: number;
  equipmentType: string;
  hasLicense: boolean;
  isAvailable: boolean;
  photoUrl?: string;
  phoneNumber: string;
  isVerified: boolean;
  userType: string;
  password?: string; // لا ينصح بتخزينه في الواجهة الأمامية
  createdAt?: Date;
  updatedAt:Date;

}
export interface OwnerData {
  id?: string;
  photoUrl?: string; // Optional string for the photo URL
  name?: string; // Optional string for the owner's name
  phoneNumber?: string; // Optional string for the phone number
  isVerified?: boolean; // Optional boolean for the verification status
  equipmentDetails?: string; // Optional string for the equipment details
  userType: string;
  password?: string;
  createdAt: Date;
  updatedAt:Date;
}
export interface User {
  id: string | undefined;
  name: string;
  phoneNumber: string;
  userType: 'drivers' | 'equipmentOwners';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | undefined;
  password?: string;
  age?: number;
  equipmentType?: string;
  hasLicense?: boolean;
  photoUrl?: string;
  isAvailable?: boolean;

}

export interface UpdateResult<T = Driver|OwnerData> {
  success: boolean;
  data?: T;
  error?: unknown;
}
export interface Equipment {
  id: string;
  name: string;
  description: string;
  equipmentType: string;
  status: string;
  price: number;
  photoUrl: string;
  ownerId: string;
  ownerPhone: string;
}
export interface OwnerData {
  id?: string;
  photoUrl?: string; // Optional string for the photo URL
  name?: string; // Optional string for the owner's name
  phoneNumber?: string; // Optional string for the phone number
  isVerified?: boolean; // Optional boolean for the verification status
  equipmentDetails?: string; // Optional string for the equipment details
  userType: string;
  password?: string;
  createdAt: Date;
}

// في ملف types/userTypes.ts أو أعلى الملف
export interface UserInfoProps {
  user: User;
  handleToggleVerification: (
    userType: 'drivers' | 'equipmentOwners',
    userId: string,
    currentStatus: boolean
  ) => Promise<void>;
}
