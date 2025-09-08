import DriverDetail from '@/components/driver/DriverDetail';
import { getDriver } from '@/lib/firebase/firestore';
import { notFound } from 'next/navigation';

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
const { id } = await params;
  // The ID from the URL is URL-encoded, so decode it
  const decodedId = decodeURIComponent(id);

  const { data: driver, error } = await getDriver(decodedId);

  if (error || !driver) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DriverDetail driver={driver} />
      </div>
    </div>
  );
}
