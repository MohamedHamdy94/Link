
import EquipmentListPublic from '@/components/equipment/EquipmentListPublic';
import { getEquipments } from '@/lib/firebase/firestore/equipments';
import { Equipment } from '@/lib/interface';

// Revalidate the data every hour
export const revalidate = 60;

export default async function EquipmentPage() {
  const { data: equipments, error } = await getEquipments();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 text-center">
        <p className="text-red-500">فشل في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EquipmentListPublic equipments={equipments as Equipment[]} />
      </div>
    </div>
  );
}

