"use client";

import { useEffect, useState } from "react";
import NavbarItemList from "./NavbarItemList";
import NavbarItemForm from "./NavbarItemForm";

export default function NavbarManagerPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchItems = async () => {
    const res = await fetch("/api/navbar-items");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (item: any) => {
    if (item.id) {
      await fetch(`/api/navbar-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify(item),
      });
    } else {
      await fetch("/api/navbar-items", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify(item),
      });
    }
    await fetchItems();
    setSelectedItem(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/navbar-items/${id}`, {
      method: "DELETE",
      headers: { "x-user-role": "ADMIN" },
    });
    await fetchItems();
  };

  return (
    <div className="p-6 min-h-screen  text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#30D5C8]">
        Navbar Items Management
      </h1>

      <NavbarItemForm
        selectedItem={selectedItem}
        onSave={handleSave}
        onCancel={() => setSelectedItem(null)}
      />

      <NavbarItemList
        items={items}
        onEdit={setSelectedItem}
        onDelete={handleDelete}
      />
    </div>
  );
}
