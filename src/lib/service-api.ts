import { Category, Service, CategoryFormData, ServiceFormData } from '../components/service-crud/type';

export const api = {
  // Category operations
  async getCategories(): Promise<Category[]> {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  async createCategory(data: Omit<CategoryFormData, 'id'>): Promise<void> {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
  },

  async updateCategory(id: number, data: CategoryFormData): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
  },

  async deleteCategory(id: number): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete category");
  },

  // Service operations
  async getServices(categoryId: number): Promise<Service[]> {
    const res = await fetch(`/api/services?category_id=${categoryId}`);
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
  },

  async createService(data: Omit<ServiceFormData, 'id'> & { features: string[] }): Promise<void> {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create service");
  },

  async updateService(id: number, data: ServiceFormData & { features: string[] }): Promise<void> {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update service");
  },

  async deleteService(id: number): Promise<void> {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete service");
  },
};