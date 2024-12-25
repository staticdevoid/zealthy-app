// src/components/UserTable.tsx

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { User } from "@prisma/client";

interface UserTableProps {
  user: User;
}

const UserTable: React.FC<UserTableProps> = ({ user }) => {
  // Define the fields to display
  const fields: { label: string; value: string }[] = [
    { label: "ID", value: user.id.toString() },
    { label: "Email", value: user.email || "N/A" },
    { label: "About Me", value: user.aboutMe || "N/A" },
    { label: "Street", value: user.street || "N/A" },
    { label: "City", value: user.city || "N/A" },
    { label: "State", value: user.state || "N/A" },
    { label: "Postal Code", value: user.postalCode || "N/A" },
    { label: "Country", value: user.country || "N/A" },
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
    <Box display="flex" justifyContent="center" mt={4}>
      <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
        <Table aria-label="user details table">
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.label}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: "bold", width: "30%" }}
                >
                  {field.label}
                </TableCell>
                <TableCell>{field.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserTable;
