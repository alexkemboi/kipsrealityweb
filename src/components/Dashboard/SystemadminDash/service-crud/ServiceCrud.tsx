"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import CategoryCard from "./CatergoryCard";
import CategoryModal from "./CategoryModal";
import ServiceModal from "./ServiceModal";
import { Category, CategoryFormData, ServiceFormData, Service } from "./type";

interface Props {
  initialCategories: Category[];
}

export default function ServiceCrud({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);
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

  // ✅ Handlers for modals
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
      setLoading(true);
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
      window.location.reload(); // ✅ Refresh server data
    } catch (err) {
      toast.error("Error saving category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      setLoading(true);
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted successfully");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to delete category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleServiceChange = (
    field: keyof ServiceFormData,
    value: string | number | string[]
  ) => {
    setServiceForm({ ...serviceForm, [field]: value });
  };

  const saveService = async () => {
    if (!serviceForm.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    const featuresArray =
      typeof serviceForm.features === "string"
        ? serviceForm.features.split(",").map((f) => f.trim()).filter(Boolean)
        : serviceForm.features;

    const body = { ...serviceForm, features: featuresArray };

    try {
      setLoading(true);
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
      window.location.reload();
    } catch (err) {
      toast.error("Error saving service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      setLoading(true);
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted successfully");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to delete service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render UI
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: 2,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={700}>
            Categories & Services Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your service categories and offerings
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => openCategoryModal()}
        >
          Add Category
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) : categories.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            bgcolor: "grey.50",
            border: 2,
            borderColor: "grey.200",
            borderStyle: "dashed",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No categories yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first category to get started!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCategoryModal()}
          >
            Create Category
          </Button>
        </Paper>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {categories.map((cat) => (
            <div key={cat.id}>
              <CategoryCard
                category={cat}
                onEditCategory={openCategoryModal}
                onDeleteCategory={deleteCategory}
                onAddService={openServiceModal}
                onEditService={openServiceModal}
                onDeleteService={deleteService}
              />
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={categoryModalOpen}
        categoryForm={categoryForm}
        onClose={() => setCategoryModalOpen(false)}
        onSave={saveCategory}
        onChange={handleCategoryChange}
      />

      <ServiceModal
        isOpen={serviceModalOpen}
        serviceForm={serviceForm}
        categories={categories}
        onClose={() => setServiceModalOpen(false)}
        onSave={saveService}
        onChange={handleServiceChange}
      />
    </Container>
  );
}
