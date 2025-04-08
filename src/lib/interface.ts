// تعريف نوع بيانات السائق
export interface Driver {
  id: string;
  name: string;
  age: number;
  equipmentType: string;
  isAvailable: boolean;
  hasLicense: boolean;
  photoUrl?: string;
  phoneNumber: string;
  isVerified: boolean;
  userType:string
}
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  userType: 'drivers' | 'equipmentOwners'; // تأكد من أن القيم تتطابق مع ما لديك
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date; // هذا الحقل اختياري
  age?: number; // هذا الحقل اختياري
  equipmentType?: string; // هذا الحقل اختياري
  hasLicense?: boolean; // هذا الحقل اختياري
  isAvailable?: boolean; // هذا الحقل اختياري
  equipmentDetails?: string; // هذا الحقل اختياري
  photoUrl?: string; // هذا الحقل اختياري
  password?: string; // لا ينصح بتخزينه في الواجهة الأمامية
}
export interface UpdateResult<T = Driver> {
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
  price: 250000;
  photoUrl: string;
  ownerId: string;
  ownerPhone: string;
}
export interface OwnerData {
  photoUrl?: string;         // Optional string for the photo URL
  name?: string;             // Optional string for the owner's name
  phoneNumber?: string;      // Optional string for the phone number
  isVerified?: boolean;      // Optional boolean for the verification status
  equipmentDetails?: string; // Optional string for the equipment details
  userType:string 
}