"use client";

interface Feature {
  id: number;
  title: string;
  description?: string;
  key?: string;
  category?: string;
  path?: string;
  icon?: string;
  isActive?: boolean;
}

interface Props {
  feature: Feature;
  onEdit: (f: Feature) => void;
  onDelete: (id: number) => void;
}

export default function FeatureItem({ feature, onEdit, onDelete }: Props) {
  return (
    <li
      className={`border border-gray-200 rounded-lg p-4 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 
        bg-white transition-all duration-200 shadow-sm hover:shadow-md ${
          feature.isActive ? "opacity-100" : "opacity-70"
        }`}
    >
      {/* Feature details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {feature.icon && (
            <span className="text-gray-600 text-lg">
              <i className={`ri-${feature.icon}-line`}></i>
            </span>
          )}
          <h3 className="font-semibold text-base sm:text-lg text-gray-900">
            {feature.title}
          </h3>

          {/* Active/Inactive badge */}
          <span
            className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
              feature.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {feature.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {feature.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            {feature.description}
          </p>
        )}

        {/* Optional metadata */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {feature.key && (
            <span>
              <strong>Key:</strong> {feature.key}
            </span>
          )}
          {feature.category && (
            <span>
              <strong>Category:</strong> {feature.category}
            </span>
          )}
          {feature.path && (
            <span>
              <strong>Path:</strong> {feature.path}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 sm:gap-2 sm:flex-shrink-0 self-end sm:self-center">
        <button
          onClick={() => onEdit(feature)}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(feature.id)}
          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
