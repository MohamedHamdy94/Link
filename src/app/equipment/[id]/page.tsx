import EquipmentDetail from '@/components/equipment/EquipmentDetail';
import { getEquipmentById } from '@/lib/firebase/firestore/equipments';
import { notFound } from 'next/navigation';


export const revalidate = 60; // Revalidate every 60 seconds

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
const { id } = await params;
  const { data: equipment, error } = await getEquipmentById(id);

  if (error || !equipment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EquipmentDetail equipment={equipment} />
      </div>
    </div>
  );
}
