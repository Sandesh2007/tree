"use client";

import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700
                     text-neutral-900 dark:text-neutral-50
                     bg-white dark:bg-neutral-800
                     focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10
                     focus:border-neutral-400 dark:focus:border-neutral-500
                     transition-all duration-200 appearance-none cursor-pointer"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
