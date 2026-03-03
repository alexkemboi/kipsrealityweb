//src/hooks/useAgentInvite.ts
// Todo: use the hook in the agent invitation page and dashboard, and make sure to handle the loading and error states properly.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type InviteData = {
  token: string;
  invitedBy: string;
  role: string;
  email: string;
  expiresAt: string;
  isValid: boolean;
  tenantId?: string;
};

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function useAgentInvite(token: string) {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const router = useRouter();

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  // Fetch invite data
  useEffect(() => {
    if (!isClient) return;

    if (!token) {
      setStatus("error");
      setLoading(false);
      return;
    }

    const fetchInviteData = async () => {
      try {
        const response = await fetch("/api/auth/invites/agent/verify-invite", { // browser console says the error is coming from this line!!!
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.isValid) {
          setStatus("error");
          setInviteData(null);
          setLoading(false);
          return;
        }

        setInviteData(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch invite data:", error);
        setStatus("error");
        setInviteData(null);
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [token, isClient]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setAccepting(true);
    
    try {
      // Call accept-invite API endpoint
      const response = await fetch("/api/auth/invites/agent/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Failed to accept invite:", error);
      setStatus("error");
    } finally {
      setAccepting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetStatus = () => {
    setStatus(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    // State
    isClient,
    loading,
    accepting,
    status,
    inviteData,
    showPassword,
    showConfirmPassword,
    formData,
    errors,

    // Actions
    handleSubmit,
    handleInputChange,
    resetStatus,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
}

export type { InviteData, FormData };