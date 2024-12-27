
# Zealthy - Custom Onboarding Flow

This project implements a dynamic "Custom Onboarding Flow" for users with an admin interface to manage onboarding steps and a data table to view submitted user data.

---

## Features

### 1. User Onboarding Wizard

- Multi-step wizard for collecting user data:
  - **Step 1**: Email and password.
  - **Step 2 & Step 3**: Customizable sections for "About Me," address fields, and birthdate.
- Progress indicator to show the current step.
- Saves progress and user data during the flow.

### 2. Admin Section

- Accessible at `/admin`.
- Allows admins to manage onboarding sections:
  - Move components between steps.
  - Toggle visibility of sections on the frontend.

### 3. Data Table

- Accessible at `/data`.
- Displays a table of user data stored in the database.

---

## Technologies Used

### Frontend

- **Next.js**: For the user interface.
- **Tailwind CSS**: For styling.
- **Zustand**: For state management and persistence.

### Backend

- **tRPC**: For type-safe API development.
- **Prisma**: For database interaction.
- **MySQL**: Database for storing user and form data.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/staticdevoid/zealthy-app
cd zealthy-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Database

- Update the `.env` file with your MySQL database credentials.

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Migrate the Database

```bash
npx prisma migrate dev
```

---

## File Structure

```plaintext
.
├── app
│   ├── _components      # Reusable components like Wizard and CustomFieldInput
│   ├── _stores          # Zustand stores for global state management
│   ├── admin            # Admin-related components
│   ├── api              # tRPC API setup
│   └── data             # Data table components
├── server
│   ├── api              # API routes
│   └── schema           # Prisma schema
├── styles               # Tailwind CSS configuration
└── types                # TypeScript type definitions
```

---

## Demo

- Wizard: `/`
- Admin Panel: `/admin`
- Data Table: `/data`
