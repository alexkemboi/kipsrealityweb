import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function ProfileCard() {
  const { profile } = dashboardData;
  return (
    <div className="mt-6 p-4 border rounded-lg bg-white">
      <h3 className="text-gray-700 font-semibold mb-2">Profile & Settings</h3>
      <p><strong>Company:</strong> {profile.name}</p>
      <p><strong>Contact:</strong> {profile.contactPerson}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Address:</strong> {profile.address}</p>
      <div className="mt-2">
        <h4 className="font-medium">Certifications:</h4>
        <ul>
          {profile.certifications.map((cert) => (
            <li key={cert.id}>{cert.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
