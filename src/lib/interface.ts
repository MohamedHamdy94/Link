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
}
export interface User {
  id: string;
  name: string;
  photoUrl?: string;
  phoneNumber: string;
  isVerified: boolean;
  password:string;
  userType:"driver" | "equipmentOwner"
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
}