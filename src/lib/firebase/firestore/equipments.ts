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
  deleteDoc, // Import deleteDoc
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Equipment } from '@/lib/interface';
import { deleteFileByUrl } from '@/lib/firebase/storage';

const EQUIPMENT_COLLECTION = 'equipment';

// Equipment functions
export const createEquipment = async (equipmentData: Omit<Equipment, 'id' | 'fbId'>) => {
  try {
    const equipmentRef = doc(collection(db, EQUIPMENT_COLLECTION));
    const newEquipmentData: Equipment = {
      ...equipmentData,
      id: equipmentRef.id,
      fbId: equipmentRef.id,
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
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
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
        priceOnRequest: data.priceOnRequest || false,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [], // Updated to photoUrls
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        ownerName: data.ownerName || '',
        ownerPhotoUrl: data.ownerPhotoUrl || '',
        ownerAddress: data.ownerAddress || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt || new Date().toISOString()),
      }
    };
  } catch (error) {
    console.error('Error getting Equipment:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
};

export const getEquipments = async () => {
  try {
    const q = query(collection(db, EQUIPMENT_COLLECTION), where('status', 'in', ['rent', 'sale']));
    const querySnapshot = await getDocs(q);

    const equipments: Equipment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      equipments.push({
        fbId: doc.id,
        id: doc.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        priceOnRequest: data.priceOnRequest || false,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [], // Updated to photoUrls
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        ownerName: data.ownerName || '',
        ownerPhotoUrl: data.ownerPhotoUrl || '',
        ownerAddress: data.ownerAddress || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt || new Date().toISOString()),
      });
    });
    return { 
      success: true, 
      data: equipments 
    };
  } catch (error) {
    console.error('Error getting equipments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get equipments' 
    };
  }
};

export const updateEquipment = async (equipmentId: string, equipmentData: Partial<Equipment>) => {
  try {
      const dataToUpdate = {
        ...equipmentData,
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId), dataToUpdate);
      return { success: true };
  } catch (error) {
    console.error("❌ Update error:", error);
    return { success: false, error };
  }
};

// New function to delete equipment and its photos
export const deleteEquipment = async (equipmentId: string) => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Equipment not found for deletion.');
    }
    
    const data = docSnap.data();
    const photoUrls = Array.isArray(data.photoUrls) ? data.photoUrls : [];

    // 2. Delete all associated photos from Firebase Storage
    if (photoUrls.length > 0) {
      console.log(`Deleting ${photoUrls.length} photos from storage...`);
      const deletePromises = photoUrls.map(url => deleteFileByUrl(url));
      await Promise.all(deletePromises);
      console.log('All photos deleted from storage.');
    }

    // 3. Delete the equipment document from Firestore
    await deleteDoc(docRef);
    console.log(`Equipment document with ID ${equipmentId} deleted from Firestore.`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete equipment' };
  }
};

// New function to update owner details in all their equipment documents
export const updateEquipmentOwnerDetailsInEquipments = async (
  ownerId: string,
    ownerDetails: { ownerName?: string; ownerPhotoUrl?: string, ownerAddress?: string }
) => {
  try {
    const equipmentQuery = query(
      collection(db, EQUIPMENT_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const equipmentSnapshot = await getDocs(equipmentQuery);

    if (equipmentSnapshot.empty) {
      console.log("No equipment found for this owner, no updates needed.");
      return { success: true };
    }

    const batch = writeBatch(db);
    
    // الحل النوعي الآمن - استخدام Record<string, unknown>
    const dataToUpdate: Record<string, unknown> = { 
      ...ownerDetails, 
      updatedAt: new Date() 
    };

    equipmentSnapshot.forEach((doc) => {
      batch.update(doc.ref, dataToUpdate);
    });

    await batch.commit();
    console.log(`Successfully updated ${equipmentSnapshot.size} equipment documents for owner ${ownerId}.`);
    return { success: true };
  } catch (error) {
    console.error('Error updating owner details in equipment documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update equipment documents' 
    };
  }
};

export const getOwnerEquipment = async (ownerId: string) => {
  try {
    const equipmentQuery = query(
      collection(db, EQUIPMENT_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const equipmentSnapshot = await getDocs(equipmentQuery);
    const equipment: Equipment[] = []; // Use Equipment[] type
    equipmentSnapshot.forEach((doc) => {
      const data = doc.data();
      equipment.push({
        fbId: doc.id,
        id: doc.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        priceOnRequest: data.priceOnRequest || false,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        ownerName: data.ownerName || '',
        ownerPhotoUrl: data.ownerPhotoUrl || '',
        ownerAddress: data.ownerAddress || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt || new Date().toISOString()),
      });
    });
    return { success: true, data: equipment };
  } catch (error) {
    console.error('Error getting owner equipment:', error);
    return { success: false, error };
  }
};