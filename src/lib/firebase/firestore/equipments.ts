// Firestore utility functions
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getAdminDb } from '@/lib/firebase/admin';
import { Equipment} from '@/lib/interface';

// User collections

const EQUIPMENT_COLLECTION = 'equipment';


// Equipment functions
export const createEquipment = async (equipmentData: Equipment) => {
  try {
    const equipmentRef = doc(collection(db, EQUIPMENT_COLLECTION));
    const newEquipmentData = {
      ...equipmentData,
      fbId: equipmentRef.id, // حفظ معرف المستند كـ fbId
    };
    await setDoc(equipmentRef, newEquipmentData);
    return { success: true, id: equipmentRef.id };
  } catch (error) {
    console.error('Error creating equipment:', error);
    return { success: false, error };
  }
};



export const getEquipmentById = async (id: string): Promise<{ success: boolean; data?: Equipment; error?: string }> => {
  try {
    console.log('getEquipmentById: Searching for equipment with ID:', id);
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('getEquipmentById: Equipment not found for ID:', id);
      return { success: false, error: 'Equipment not found' };
    }

    const data = docSnap.data();

    return {
      success: true,
      data: {
        fbId: docSnap.id,
        id: docSnap.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrl: data.photoUrl || '',
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error getting Equipment:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
};









export const getEquipments = async () => {
  
  try {
    const q = query(collection(db, EQUIPMENT_COLLECTION), where('status', '!=', 'work'));
    const querySnapshot = await getDocs(q);

    const equipments: Equipment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const equipment: Equipment = {
        fbId: doc.id,
        id: doc.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrl: data.photoUrl || '',
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
      equipments.push(equipment);
    });
    return { 
      success: true, 
      data: equipments 
    };
  } catch (error) {
    console.error('Error getting owner equipments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get equipments' 
    };
  }
};


export const updateEquipment = async (equipmentId: string, equipmentData: Equipment) => {
  try {
      await updateDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId), {
      ...equipmentData,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Update error:", error);
    return { success: false, error };
  }
};


export const getOwnerEquipment = async (ownerId: string) => {
  try {
    const equipmentQuery = query(
      collection(db, EQUIPMENT_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const equipmentSnapshot = await getDocs(equipmentQuery);
    const equipment: DocumentData[] = [];
    equipmentSnapshot.forEach((doc) => {
      equipment.push({ fbId: doc.id, ...doc.data() });
    });
    return { success: true, data: equipment };
  } catch (error) {
    console.error('Error getting owner equipment:', error);
    return { success: false, error };
  }
};