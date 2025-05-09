import { Equipment } from '@/lib/interface';


const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  return (<>
    {/* <div className="bg-white overflow-hidden shadow-md rounded-lg h-full flex flex-col">
        {equipment.photoUrl ? (
          <img
            src={equipment.photoUrl}
            alt={equipment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">لا توجد صورة</span>
          </div>
        )}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              equipment.status === 'rent'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {equipment.status === 'rent' ? 'للإيجار' : 'للبيع'}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 text-right">
            {equipment.name}
          </h3>
        </div>

        <div className="mt-2 text-right flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3">
            {equipment.description}
          </p>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">
            {equipment.price} ريال {equipment.status === 'rent' ? '/ يوم' : ''}
          </span>
          <span className="text-sm text-gray-500">
            {equipment.equipmentType}
          </span>
        </div>
      </div>
    </div> */}
        <div className="bg-gray-10 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-2 sm:px-2 transition-all duration-500 transform">
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
        {/* صورة السائق */}
        <img
          src={equipment.photoUrl || '/images/imagesProfile.jpg'}
          alt={equipment.name || 'صورة المستخدم'}
          className="w-full h-full object-cover bg-gray-200"
        />

        {/* معلومات السائق */}
        <div className="transition-all transform duration-500">
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            {equipment.name}
          </h1>
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            سائق {equipment.equipmentType}
          </h1>
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            {equipment.description} سنة
          </h1>
      
        </div>
      </div>

      {/* حالة التوفر */}
      <div className="absolute top-1 delay-300 -bottom-16 transition-all duration-500 lift-1 rounded-lg">
        <div className="inline-flex flex-wrap gap-2">
          <div>
            <span className="py-1 px-2 inline-flex items-center gap-x-1 text-sm font-medium bg-green-600 text-teal-100 rounded-full">
              <svg
                className="shrink-0 size-5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              متاح
            </span>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};
export default EquipmentCard;