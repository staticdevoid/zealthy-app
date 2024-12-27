import React from "react";
import { type User } from "@prisma/client";

interface UserTableProps {
  user: User;
}

const UserTable: React.FC<UserTableProps> = ({ user }) => {
  // Define the fields to display
  const fields: { label: string; value: string }[] = [
    { label: "ID", value: user.id.toString() },
    { label: "Email", value: user.email ?? "N/A" },
    { label: "About Me", value: user.aboutMe ?? "N/A" },
    { label: "Street", value: user.street ?? "N/A" },
    { label: "City", value: user.city ?? "N/A" },
    { label: "State", value: user.state ?? "N/A" },
    { label: "Postal Code", value: user.postalCode ?? "N/A" },
    { label: "Country", value: user.country ?? "N/A" },
    {
      label: "Birthdate",
      value: user.birthdate
        ? new Date(user.birthdate).toLocaleDateString()
        : "N/A",
    },
    {
      label: "Created At",
      value: new Date(user.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="mt-8 flex justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full border-collapse text-left">
          <tbody>
            {fields.map((field) => (
              <tr
                key={field.label}
                className="border-b last:border-none hover:bg-gray-100"
              >
                <th
                  className="w-1/3 bg-gray-50 px-4 py-3 font-semibold text-gray-700"
                  scope="row"
                >
                  {field.label}
                </th>
                <td className="px-4 py-3 text-gray-800">{field.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
