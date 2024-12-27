"use client";

import React from "react";

import { api } from "~/trpc/react";
import { useWizardStore } from "../_stores/wizardStore";
import UserTable from "../_components/userTable";

const DataPage: React.FC = () => {
  // Retrieve the persisted email from the wizard store
  const email = useWizardStore((state) => state.authenticatedEmail);

  // Fetch the user based on the email using TRPC
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.getUserByEmail.useQuery({ email });

  return (
    <div className="container mx-auto mt-8">
      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="loader">Loading...</div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="mt-8 rounded border border-red-600 p-4 text-red-600">
          {error?.message ?? "An error occurred while fetching the user."}
        </div>
      )}

      {/* User Data or No User State */}
      {!isLoading && user ? (
        <UserTable
          user={
            {
              ...user,
              birthdate: user.birthdate ? user.birthdate.toISOString() : null,
              createdAt: user.createdAt.toISOString(),
            } // Ensure createdAt is also a string
          }
        />
      ) : (
        !isLoading && (
          <div className="mt-8 rounded border border-blue-600 p-4 text-blue-600">
            No user found.
          </div>
        )
      )}
    </div>
  );
};

export default DataPage;
