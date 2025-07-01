import { useState } from 'react';
import { updateSecretNumber } from '../actions';

export default function SecretNumberManagementPage() {
  const [userType, setUserType] = useState<'drivers' | 'equipmentOwners'>('drivers');
  const [userId, setUserId] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const result = await updateSecretNumber(userType, userId, secretNumber);

    if (result.success) {
      setMessage(result.message);
      setUserId('');
      setSecretNumber('');
    } else {
      setMessage(result.message);
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Manage Secret Numbers</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'drivers' | 'equipmentOwners')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="drivers">Driver</option>
              <option value="equipmentOwners">Equipment Owner</option>
            </select>
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID (Phone Number)</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter user ID (e.g., phone number)"
              required
            />
          </div>
          <div>
            <label htmlFor="secretNumber" className="block text-sm font-medium text-gray-700">New Secret Number</label>
            <input
              type="text"
              id="secretNumber"
              value={secretNumber}
              onChange={(e) => setSecretNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter new secret number"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Secret Number
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-md ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
