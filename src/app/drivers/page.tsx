import DriversList from '@/components/driver/DriversList';
import { getDrivers } from '@/lib/firebase/firestore';
import { Driver } from '@/lib/interface';

// Revalidate the data every hour
export const revalidate = 300;

export default async function DriversListPage() {
  const { data: drivers, error } = await getDrivers();

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
        <DriversList initialDrivers={drivers as Driver[]} />
      </div>
    </div>
  );
}
