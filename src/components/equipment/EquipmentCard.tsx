import { Equipment } from '@/lib/interface';


const EquipmentCard = ({ item }: { item: Equipment }) => {
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


   <div className="h-full w-full overflow-hidden">
                 {item.photoUrl ? (
                   <img 
                     src={item.photoUrl} 
                     alt={item.name} 
                     className="w-50 h-50 object-cover"
                   />
                 ) : (
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                     <span className="text-gray-500 text-sm">لا توجد صورة</span>
                   </div>
                 )}
               </div>
               <div className="p-3 md:p-4 flex-grow flex flex-col">
                 <div className="flex justify-between items-start">
                   <span className={`px-2 py-1 text-xs rounded-full ${
                     item.status === 'rent' 
                       ? 'bg-blue-100 text-blue-800' 
                       : 'bg-green-100 text-green-800'
                   }`}>
                     {item.status === 'rent' ? 'للإيجار' : 'للبيع'}
                   </span>
                   <h3 className="text-base md:text-lg font-semibold text-gray-900 text-right">
                     {item.name}
                   </h3>
                 </div>
                
                 <div className="mt-2 text-right flex-grow">
                   <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                     {item.description}
                   </p>
                 </div>
                
                 <div className="mt-3 flex justify-between items-center">
                   <span className="text-xs md:text-sm font-medium text-gray-900">
                     {item.price} ريال {item.status === 'rent' ? '/ يوم' : ''}
                   </span>
                   <span className="text-xs md:text-sm text-gray-500">
                     {item.equipmentType}
                   </span>
                 </div>
                
                 <div className="mt-3 pt-2 border-t border-gray-200">
                   <div className="flex justify-between items-center">
                     <a 
                       href={`tel:${item.ownerPhone}`}
                       className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium"
                     >
                       اتصل بالمالك
                     </a>
                     <span className="text-xs md:text-sm text-gray-500 dir-ltr">
                       {item.ownerPhone}
                     </span>
                   </div>
                 </div>
               </div>
  </>
  );
};
export default EquipmentCard;