import EditEquipmentClient from './EditEquipmentClient';
import { getEquipmentById } from '@/lib/firebase/firestore';
import { Equipment } from '@/lib/interface';



export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  // استخراج id من params بشكل صحيح
  //const { id } = await params
  const id = (await params).id;

  const equipmentData = await getEquipmentById(id);
console.log(equipmentData)
  if (!equipmentData.success || !equipmentData.data) {
    return <div className="text-center py-10">لم يتم العثور على المعدة</div>;
  }

  // تحويل البيانات بشكل آمن
  const data = equipmentData.data;
  console.log(data)

  const serializedData: Equipment = {
...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };

  return <EditEquipmentClient  initialData={serializedData} />;
}