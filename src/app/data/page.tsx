"use client";

import React from "react";
import { api } from "~/trpc/react";
import UserTable from "../_components/userTable";

const DataPage: React.FC = () => {
  // Fetch all users using TRPC
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = api.user.getUserTable.useQuery();

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-center text-2xl font-bold">All Users</h1>

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="loader">Loading...</div>
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded border border-red-600 p-4 text-red-600">
          {error?.message ?? "An error occurred while fetching users."}
        </div>
      )}

      {users ? (
        <UserTable users={users ?? []} />
      ) : (
        !isLoading && (
          <div className="mt-8 rounded border border-blue-600 p-4 text-blue-600">
            No users found.
          </div>
        )
      )}
    </div>
  );
};

export default DataPage;
