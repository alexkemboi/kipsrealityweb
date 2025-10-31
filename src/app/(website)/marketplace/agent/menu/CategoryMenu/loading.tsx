// app/marketplace/categories/loading.tsx
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-pulse text-gray-500 text-lg">
        Loading categories...
      </div>
    </div>
  );
}
