//app/(dashboard)/property-manager/content/utilities/new/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewUtilityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "FIXED",
    unitPrice: "",
    fixedAmount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error("Please enter a utility name");
      return;
    }

    if (form.type === "METERED" && (!form.unitPrice || parseFloat(form.unitPrice) <= 0)) {
      toast.error("Please enter a valid unit price for metered utilities");
      return;
    }

    if (form.type === "FIXED" && (!form.fixedAmount || parseFloat(form.fixedAmount) <= 0)) {
      toast.error("Please enter a valid fixed amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          unitPrice: form.type === "METERED" ? parseFloat(form.unitPrice) : null,
          fixedAmount: form.type === "FIXED" ? parseFloat(form.fixedAmount) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Utility created successfully!");
        setTimeout(() => {
          router.push("/property-manager/content/utilities");
        }, 1000);
      } else {
        toast.error(data.error || "Failed to create utility");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An error occurred while creating the utility");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex items-center gap-4">
        <Link href="/property-manager/content/utilities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Utilities
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Utility</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Utility Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Electricity, Water, Gas"
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Billing Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v, unitPrice: "", fixedAmount: "" })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Amount (Same charge each period)</SelectItem>
                  <SelectItem value="METERED">Metered (Based on usage)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.type === "METERED" && (
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (per unit) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  name="unitPrice"
                  placeholder="e.g., 12.50"
                  step="0.01"
                  min="0"
                  value={form.unitPrice}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-sm text-gray-500">
                  Price charged per unit of consumption (e.g., per kWh, gallon, etc.)
                </p>
              </div>
            )}

            {form.type === "FIXED" && (
              <div className="space-y-2">
                <Label htmlFor="fixedAmount">Fixed Amount *</Label>
                <Input
                  id="fixedAmount"
                  type="number"
                  name="fixedAmount"
                  placeholder="e.g., 50.00"
                  step="0.01"
                  min="0"
                  value={form.fixedAmount}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-sm text-gray-500">
                  Fixed amount charged each billing period
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Utility"
                )}
              </Button>
              <Link href="/property-manager/content/utilities" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}