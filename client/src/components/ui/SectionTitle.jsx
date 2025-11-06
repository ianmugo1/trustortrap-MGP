export default function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-semibold tracking-tight mb-4 ${className}`}>
      {children}
    </h2>
  );
}
