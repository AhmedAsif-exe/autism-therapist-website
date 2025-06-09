import ResourceCard from "./ResourceCard";

export default function ResourceList({ resources, category, type }) {
  const filtered = resources.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      (type === "All" || r.type === type)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {filtered.map((res) => (
        <ResourceCard key={res.id} resource={res} />
      ))}
    </div>
  );
}
