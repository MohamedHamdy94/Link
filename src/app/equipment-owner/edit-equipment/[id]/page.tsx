import EditEquipmentClient from './EditEquipmentClient';
import { getEquipmentById } from '@/lib/firebase/firestore';
import { Equipment } from '@/lib/interface';



export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  // استخراج id من params بشكل صحيح
  const { id } = await params
console.log(id)
  const equipmentData = await getEquipmentById(id);

  if (!equipmentData.success || !equipmentData.data) {
    return <div className="text-center py-10">لم يتم العثور على المعدة</div>;
  }

  // تحويل البيانات بشكل آمن
  const data = equipmentData.data;
  const serializedData: Equipment = {
    ...data,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };

  return <EditEquipmentClient id={id} initialData={serializedData} />;
}