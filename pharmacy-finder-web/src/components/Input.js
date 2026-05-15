export default function Input({ label, type = 'text', value, onChange, placeholder, name }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-text mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text placeholder-textLight transition"
      />
    </div>
  );
}
