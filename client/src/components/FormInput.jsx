"use client";
export default function FormInput({
  label, type = "text", value, onChange, placeholder, required = false, ...rest
}) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm text-gray-700">{label}</span>}
      <input
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-gray-300"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    </label>
  );
}
