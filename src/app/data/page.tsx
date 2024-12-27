"use client";

import React from "react";

import { api } from "~/trpc/react";
import { useWizardStore } from "../_stores/wizardStore";
import UserTable from "../_components/userTable";

const DataPage: React.FC = () => {
  // Retrieve the persisted email from the wizard store
  const email = useWizardStore((state) => state.authenticatedEmail);
  console.log(email);
  // Fetch the user based on the email using TRPC
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.getUserByEmail.useQuery({ email });

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-center text-2xl font-bold">User Details</h1>

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="loader">Loading...</div>
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded border border-red-600 p-4 text-red-600">
          {error?.message ?? "An error occurred while fetching the user."}
        </div>
      )}

      {user ? (
        <UserTable user={user} />
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
