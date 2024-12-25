// src/app/data/page.tsx

"use client";

import React from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import UserTable from "../_components/userTable";
import { api } from "~/trpc/react";

const DataPage: React.FC = () => {
  // Fetch the user with id=1 using TRPC
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.getUserTable.useQuery();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          User Details
        </Typography>

        {isLoading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box mt={4}>
            <Alert severity="error">
              {error?.message || "An error occurred while fetching the user."}
            </Alert>
          </Box>
        )}

        {user ? (
          <UserTable user={user} />
        ) : (
          !isLoading && (
            <Box mt={4}>
              <Alert severity="info">No user found.</Alert>
            </Box>
          )
        )}
      </Box>
    </Container>
  );
};

export default DataPage;
