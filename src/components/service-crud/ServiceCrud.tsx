"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Category, Service, CategoryFormData, ServiceFormData } from "./type";
import CategoryModal from "./CategoryModal";
import ServiceModal from "./ServiceModal";
import CategoryCard from "./CatergoryCard";

export default function ServicesCRUD() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    id: 0,
    name: "",
    tagline: "",
    color: "#03346E",
  });

  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    id: 0,
    category_id: 0,
    name: "",
    description: "",
    features: [],
    impact: "",
    icon: "",
  });

  // ------------------------
  // FETCH CATEGORIES & SERVICES
  // ------------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const catsRes = await fetch("/api/categories");
      const catsData = await catsRes.json();

      const catsWithServices = await Promise.all(
        catsData.map(async (cat: Category) => {
          const servicesRes = await fetch(`/api/services?category_id=${cat.id}`);
          const servicesData = await servicesRes.json();
          return { ...cat, services: servicesData };
        })
      );

      setCategories(catsWithServices);
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ------------------------
  // CATEGORY HANDLERS
  // ------------------------
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setCategoryForm({
        id: category.id,
        name: category.name,
        tagline: category.tagline,
        color: category.color,
      });
    } else {
      setCategoryForm({ id: 0, name: "", tagline: "", color: "#03346E" });
    }
    setCategoryModalOpen(true);
  };

  const handleCategoryChange = (field: keyof CategoryFormData, value: string) => {
    setCategoryForm({ ...categoryForm, [field]: value });
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (categoryForm.id) {
        await fetch(`/api/categories/${categoryForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        });
        toast.success("Category updated successfully");
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        });
        toast.success("Category created successfully");
      }
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Error saving category");
      console.error(err);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? All associated services will be lost.")) return;

    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
      console.error(err);
    }
  };

  // ------------------------
  // SERVICE HANDLERS
  // ------------------------
  const openServiceModal = (category: Category, service?: Service) => {
    setSelectedCategory(category);

    if (service) {
      setServiceForm({
        ...service,
        category_id: category.id,
        features: service.features || [],
      });
    } else {
      setServiceForm({
        id: 0,
        category_id: category.id,
        name: "",
        description: "",
        features: [],
        impact: "",
        icon: "",
      });
    }
    setServiceModalOpen(true);
  };

  const handleServiceChange = (field: keyof ServiceFormData, value: string | number | string[]) => {
    setServiceForm({ ...serviceForm, [field]: value });
  };

  const saveService = async () => {
    if (!serviceForm.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (!serviceForm.category_id) {
      toast.error("Please select a category");
      return;
    }

    const featuresArray =
      typeof serviceForm.features === "string"
        ? serviceForm.features.split(",").map((f) => f.trim()).filter(Boolean)
        : serviceForm.features;

    const body = { ...serviceForm, features: featuresArray };

    try {
      if (serviceForm.id) {
        await fetch(`/api/services/${serviceForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Service updated successfully");
      } else {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Service created successfully");
      }
      setServiceModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Error saving service");
      console.error(err);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete service");
      console.error(err);
    }
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, pb: 2, borderBottom: 2, borderColor: "divider" }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Categories & Services Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your service categories and offerings
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => openCategoryModal()}>
          Add Category
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : categories.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: "center", py: 8, px: 4, bgcolor: "grey.50", border: 2, borderColor: "grey.200", borderStyle: "dashed", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first category to get started!
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCategoryModal()}>
            Create Category
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid item xs={12} md={6} lg={4} key={cat.id}>
              <CategoryCard
                category={cat}
                onEditCategory={openCategoryModal}
                onDeleteCategory={deleteCategory}
                onAddService={openServiceModal}
                onEditService={openServiceModal}
                onDeleteService={deleteService}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CategoryModal isOpen={categoryModalOpen} categoryForm={categoryForm} onClose={() => setCategoryModalOpen(false)} onSave={saveCategory} onChange={handleCategoryChange} />

      <ServiceModal isOpen={serviceModalOpen} serviceForm={serviceForm} categories={categories} onClose={() => setServiceModalOpen(false)} onSave={saveService} onChange={handleServiceChange} />
    </Container>
  );
}
