import EditEquipmentClient from './EditEquipmentClient';
import { getEquipmentById } from '@/lib/firebase/firestore';
import { Equipment } from '@/lib/interface';



export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const equipmentData = await getEquipmentById(id);

  if (!equipmentData.success || !equipmentData.data) {
    return <div className="text-center py-10">لم يتم العثور على المعدة</div>;
  }

  const data = equipmentData.data;

const serializeEquipment = (data:Equipment): Equipment => {
  return {
    fbId: data.fbId,
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    status: data.status,
    equipmentType: data.equipmentType,
    photoUrl: data.photoUrl || '',
    ownerId: data.ownerId,
    ownerPhone: data.ownerPhone || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};


const serializedData = serializeEquipment(data);
return <EditEquipmentClient initialData={serializedData} />;
}