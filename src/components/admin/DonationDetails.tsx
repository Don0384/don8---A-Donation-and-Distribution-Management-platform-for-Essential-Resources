
import { DonationWithProfiles } from "@/types/donations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/dateUtils";

interface DonationDetailsProps {
  donations: DonationWithProfiles[];
}

const DonationDetails = ({ donations }: DonationDetailsProps) => {
  const donorList = donations.filter(d => d.donor !== null);
  const receiverList = donations.filter(d => d.receiver !== null);
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Donations</TabsTrigger>
        <TabsTrigger value="donors">Donors</TabsTrigger>
        <TabsTrigger value="receivers">Receivers</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Donation Details</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.item_name}</TableCell>
                  <TableCell>{donation.category}</TableCell>
                  <TableCell>
                    {donation.donor ? (
                      <div>
                        <div>{donation.donor.email}</div>
                        <div className="text-xs text-gray-500">
                          {donation.donor.first_name} {donation.donor.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {donation.donor.phone || 'No phone'}
                        </div>
                      </div>
                    ) : (
                      "Unknown"
                    )}
                  </TableCell>
                  <TableCell>
                    {donation.receiver ? (
                      <div>
                        <div>{donation.receiver.email}</div>
                        <div className="text-xs text-gray-500">
                          {donation.receiver.first_name} {donation.receiver.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {donation.receiver.phone || 'No phone'}
                        </div>
                      </div>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${donation.status === 'received' ? 'bg-green-100 text-green-800' : 
                      donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                      {donation.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(donation.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      
      <TabsContent value="donors" className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Donor List</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Donations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(new Map(donorList.map(d => [d.donor_id, d.donor])).values())
                .filter(Boolean)
                .map((donor) => {
                  const donationCount = donations.filter(d => d.donor_id === donor?.id).length;
                  return (
                    <TableRow key={donor?.id}>
                      <TableCell className="font-medium">
                        {donor?.first_name} {donor?.last_name}
                      </TableCell>
                      <TableCell>{donor?.email}</TableCell>
                      <TableCell>{donor?.phone || 'N/A'}</TableCell>
                      <TableCell>{donationCount}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      
      <TabsContent value="receivers" className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Receiver List</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Donations Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(new Map(receiverList.map(d => [d.receiver_id, d.receiver])).values())
                .filter(Boolean)
                .map((receiver) => {
                  const receiveCount = donations.filter(d => d.receiver_id === receiver?.id).length;
                  return (
                    <TableRow key={receiver?.id}>
                      <TableCell className="font-medium">
                        {receiver?.first_name} {receiver?.last_name}
                      </TableCell>
                      <TableCell>{receiver?.email}</TableCell>
                      <TableCell>{receiver?.phone || 'N/A'}</TableCell>
                      <TableCell>{receiveCount}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DonationDetails;
