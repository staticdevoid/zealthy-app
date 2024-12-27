"use client";

import React from "react";

interface UserTableProps {
  user: {
    id: number;
    email: string | null;
    aboutMe: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    birthdate: string | null;
    createdAt: string;
  };
}

const UserTable: React.FC<UserTableProps> = ({ user }) => {
  const fields: { label: string; value: string }[] = [
    { label: "ID", value: user.id.toString() },
    { label: "Email", value: user.email ?? "N/A" },
    { label: "About Me", value: user.aboutMe ?? "N/A" },
    { label: "Street", value: user.street ?? "N/A" },
    { label: "City", value: user.city ?? "N/A" },
    { label: "State", value: user.state ?? "N/A" },
    { label: "Postal Code", value: user.postalCode ?? "N/A" },
    { label: "Country", value: user.country ?? "N/A" },
    { label: "Birthdate", value: user.birthdate ?? "N/A" },
    { label: "Created At", value: user.createdAt },
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-bold text-gray-800">User Details</h2>
      <table className="w-full table-auto border-collapse text-left">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="px-4 py-2 text-sm font-semibold text-gray-600">
              Field
            </th>
            <th className="px-4 py-2 text-sm font-semibold text-gray-600">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr
              key={field.label}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } border-b`}
            >
              <td className="px-4 py-2 font-medium text-gray-700">
                {field.label}
              </td>
              <td className="px-4 py-2 text-gray-600">{field.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
