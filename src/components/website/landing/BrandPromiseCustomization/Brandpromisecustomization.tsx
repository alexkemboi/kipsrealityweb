"use client";
import React, { useEffect, useState } from "react";

interface BrandPromiseType {
    id: number;
    title: string;
    content: string;
    highlight_color: string;
}

export default function BrandPromise() {
    const [data, setData] = useState<BrandPromiseType[]>([]);
    const [form, setForm] = useState({ title: "", content: "", highlight_color: "#FACC15" });

    const fetchData = async () => {
        const res = await fetch("/api/brandPromise");
        const result = await res.json();
        setData(result);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/brandPromise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setForm({ title: "", content: "", highlight_color: "#FACC15" });
        fetchData();
    };

    const handleDelete = async (id: number) => {
        await fetch(`/api/brandPromise/${id}`, { method: "DELETE" });
        fetchData();
    };

    return (
        <section id="about" className="px-8 py-20 md:px-20 bg-white">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Brand Promise Display */}
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="p-8 rounded-xl shadow space-y-4 text-center"
                        style={{ backgroundColor: `${item.highlight_color}20` }}
                    >
                        <h4 className="text-2xl font-bold" style={{ color: item.highlight_color }}>
                            {item.title}
                        </h4>
                        <p className="text-gray-700 text-lg font-medium">{item.content}</p>
                        <button
                            className="text-red-600 text-sm underline"
                            onClick={() => handleDelete(item.id)}
                        >
                            Delete
                        </button>
                    </div>
                ))}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-6 rounded-xl shadow">
                    <input
                        type="text"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="border p-2 w-full rounded"
                    />
                    <textarea
                        placeholder="Content"
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="border p-2 w-full rounded"
                    />
                    <input
                        type="color"
                        value={form.highlight_color}
                        onChange={(e) => setForm({ ...form, highlight_color: e.target.value })}
                        className="border p-2 w-full rounded"
                    />
                    <button
                        type="submit"
                        className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500"
                    >
                        Add Brand Promise
                    </button>
                </form>
            </div>
        </section>
    );
}
