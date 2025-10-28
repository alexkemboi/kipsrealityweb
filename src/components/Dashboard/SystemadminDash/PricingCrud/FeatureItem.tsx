"use client";
interface Feature { id: number; title: string; description: string; }
interface Props { feature: Feature; onEdit: (f: Feature) => void; onDelete: (id: number) => void; }

export default function FeatureItem({ feature, onEdit, onDelete }: Props) {
  return (
    <li className="border border-gray-300 rounded-md p-2 mb-2 flex justify-between items-center">
      <div>
        <p className="font-medium">{feature.title}</p>
        <p className="text-gray-500 text-sm">{feature.description}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(feature)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Edit</button>
        <button onClick={() => onDelete(feature.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">Delete</button>
      </div>
    </li>
  );
}
