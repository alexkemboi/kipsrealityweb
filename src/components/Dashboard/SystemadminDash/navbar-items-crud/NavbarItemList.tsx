"use client";

interface NavbarItemListProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export default function NavbarItemList({ items, onEdit, onDelete }: NavbarItemListProps) {
  return (
    <div className="mt-6">
      {/* --- Desktop Table --- */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-[#30D5C8]/30 shadow-sm bg-[#0b1f3a] text-white">
        <table className="w-full border-collapse">
          <thead className="bg-[#15386a]">
            <tr className="text-left text-[#30D5C8] uppercase text-sm">
              <th className="p-3 border-b border-[#30D5C8]/30">ID</th>
              <th className="p-3 border-b border-[#30D5C8]/30">Name</th>
              <th className="p-3 border-b border-[#30D5C8]/30">Href</th>
              <th className="p-3 border-b border-[#30D5C8]/30">Order</th>
              <th className="p-3 border-b border-[#30D5C8]/30">Visible</th>
              <th className="p-3 border-b border-[#30D5C8]/30">Available</th>
              <th className="p-3 border-b border-[#30D5C8]/30 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[#15386a]/60 text-center border-b border-[#30D5C8]/20 transition-colors"
              >
                <td className="p-3">{item.id}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3 break-words">{item.href}</td>
                <td className="p-3">{item.order}</td>
                <td className="p-3">{item.isVisible ? "✅" : "❌"}</td>
                <td className="p-3">{item.isAvailable ? "✅" : "❌"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 bg-[#30D5C8] text-[#0b1f3a] rounded-md hover:bg-[#25b9ad] transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Cards --- */}
      <div className="grid gap-4 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#0b1f3a] text-white rounded-lg shadow border border-[#30D5C8]/30"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-[#30D5C8]">{item.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="px-2 py-1 bg-[#30D5C8] text-[#0b1f3a] rounded text-sm hover:bg-[#25b9ad]"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-200 space-y-1">
              <p><span className="font-medium text-[#30D5C8]">Href:</span> {item.href}</p>
              <p><span className="font-medium text-[#30D5C8]">Order:</span> {item.order}</p>
              <p><span className="font-medium text-[#30D5C8]">Visible:</span> {item.isVisible ? "✅" : "❌"}</p>
              <p><span className="font-medium text-[#30D5C8]">Available:</span> {item.isAvailable ? "✅" : "❌"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
