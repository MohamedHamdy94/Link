import EditEquipmentClient from './EditEquipmentClient';
import { getEquipmentById } from '@/lib/firebase/firestore';
import { Equipment } from '@/lib/interface';



export default async function EditEquipmentPage ({ params }: { params: Promise<{ id: string }> }){

const id = (await params).id;

  const { data, success, error } = await getEquipmentById(id);

  if (!success || !data) {
    return <div className="text-center py-10">{error || 'لم يتم العثور على المعدة'}</div>;
  }

  // Serialization is important to ensure only plain objects are passed from Server to Client Components
  const serializeEquipment = (equipment: Equipment): Equipment => {
    return {
      ...equipment,
      createdAt: new Date(equipment.createdAt).toISOString(),
      updatedAt: new Date(equipment.updatedAt).toISOString(),
    };
  };

  const serializedData = serializeEquipment(data);

  return <EditEquipmentClient equipment={serializedData} />;
}