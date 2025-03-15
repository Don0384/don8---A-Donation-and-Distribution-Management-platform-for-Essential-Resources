
import { type DonationWithProfiles } from "@/types/donations";

interface DonationTableProps {
  donations: DonationWithProfiles[];
  loading: boolean;
}

const DonationTable = ({ donations, loading }: DonationTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No donations found
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{donation.item_name}</div>
                    <div className="text-sm text-gray-500">{donation.category}</div>
                    <div className="text-xs text-gray-500">{donation.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.donor ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donor.first_name} {donation.donor.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{donation.donor.email}</div>
                        <div className="text-xs text-gray-500">{donation.donor.phone || 'No phone'}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown donor</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.receiver ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.receiver.first_name} {donation.receiver.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{donation.receiver.email}</div>
                        <div className="text-xs text-gray-500">{donation.receiver.phone || 'No phone'}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No receiver yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${donation.status === 'received' ? 'bg-green-100 text-green-800' : 
                        donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;
