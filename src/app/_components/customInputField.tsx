import { type Field } from "@prisma/client";
import React, { useState, useEffect, memo } from "react";
// Adjust as needed

type CustomFieldInputProps = {
  field: Field;
  initialValue: string; // The starting value for this field
  onFieldBlur: (field: Field, newValue: string) => void;
  error?: string;
};

export const CustomFieldInput = memo(function HybridFieldInput({
  field,
  initialValue,
  onFieldBlur,
  error,
}: CustomFieldInputProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    onFieldBlur(field, value);
  };

  const inputClass = `p-3 rounded-lg border ${
    error ? "border-red-500" : "border-slate-400"
  } focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900`;

  // Render input/textarea based on the fieldType
  const renderInput = () => {
    switch (field.fieldType) {
      case "TEXT":
      case "EMAIL":
      case "NUMBER":
      case "ZIP":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "PASSWORD":
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "MULTILINETEXT":
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={inputClass}
            required={field.isRequired}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-slate-300">
        {field.label}
      </label>
      {renderInput()}
      {error && (
        <span className="absolute left-0 top-full mt-1 text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});
