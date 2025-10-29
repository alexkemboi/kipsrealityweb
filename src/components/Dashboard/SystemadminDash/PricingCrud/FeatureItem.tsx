"use client";

interface Feature { 
  id: number; 
  title: string; 
  description: string; 
}

interface Props { 
  feature: Feature; 
  onEdit: (f: Feature) => void; 
  onDelete: (id: number) => void; 
}

export default function FeatureItem({ feature, onEdit, onDelete }: Props) {
  return (
    <li className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base sm:text-lg text-gray-900 mb-1 break-words">
          {feature.title}
        </p>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed break-words">
          {feature.description}
        </p>
      </div>
      
      <div className="flex gap-2 sm:gap-2 sm:flex-shrink-0 self-end sm:self-center">
        <button 
          onClick={() => onEdit(feature)} 
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(feature.id)} 
          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          Delete
        </button>
      </div>
    </li>
  );
}