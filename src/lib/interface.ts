// تعريف نوع بيانات السائق
export type UserType = 'drivers' | 'equipmentOwners' | 'admins';

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
  createdAt?: string;
  updatedAt: string;
}
export interface OwnerData {
  id?: string;
  photoUrl?: string; // Optional string for the photo URL
  name?: string; // Optional string for the owner's name
  phoneNumber: string; // Optional string for the phone number
  isVerified?: boolean; // Optional boolean for the verification status
  equipmentDetails?: string; // Optional string for the equipment details
  userType: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}
export interface User {
  id: string | undefined;
  name: string;
  phoneNumber: string;
  userType: 'drivers' | 'equipmentOwners';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string | undefined;
  password?: string;
  age?: number;
  equipmentType?: string;
  hasLicense?: boolean;
  photoUrl?: string;
  isAvailable?: boolean;
}

export interface UpdateResult<T = Driver | OwnerData> {
  success: boolean;
  data?: T;
  error?: unknown;
}


export interface Equipment {
  fbId?: string;
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  equipmentType: string;
  photoUrl: string;
  ownerId: string;
  ownerPhone: string;
  createdAt: string; 
  updatedAt: string;
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
