"use client";

import React from "react";

type User = {
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

interface UserTableProps {
  users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">About Me</th>
            <th className="border border-gray-300 px-4 py-2">Street</th>
            <th className="border border-gray-300 px-4 py-2">City</th>
            <th className="border border-gray-300 px-4 py-2">State</th>
            <th className="border border-gray-300 px-4 py-2">Postal Code</th>
            <th className="border border-gray-300 px-4 py-2">Country</th>
            <th className="border border-gray-300 px-4 py-2">Birthdate</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="border border-gray-300 px-4 py-2 text-center"
              >
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.email ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.aboutMe ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.street ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.city ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.state ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.postalCode ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.country ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.birthdate ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.createdAt}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
