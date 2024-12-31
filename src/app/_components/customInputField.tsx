import React from "react";
import { type Field } from "~/types/types";

interface CustomFieldInputProps {
  field: Field;
  initialValue: string;
  error?: string;
  onFieldBlur: (field: Field, newValue: string) => void;
}

export const CustomFieldInput: React.FC<CustomFieldInputProps> = ({
  field,
  initialValue,
  error,
  onFieldBlur,
}) => {
  const [value, setValue] = React.useState(initialValue);

  const handleBlur = () => {
    onFieldBlur(field, value);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={field.userProperty}
        className="mb-1 block text-sm font-medium text-slate-200"
      >
        {field.label}
      </label>
      <div className="relative">
        <input
          type={field.fieldType}
          id={field.userProperty}
          name={field.userProperty}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className={`block w-full rounded-lg border px-4 py-2 ${
            error
              ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500"
              : "border-gray-600 bg-slate-800 text-slate-200 focus:border-green-500 focus:ring-green-500"
          } shadow-sm focus:outline-none focus:ring`}
        />
        {error && (
          <div className="absolute top-full mt-1 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
