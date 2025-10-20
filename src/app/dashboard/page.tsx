"use client"
import React from "react";
import Dashboard from "@/components/Dashboard/dashboard";
import Layout from "@/components/layout";

const DashboardPage = () => {
  return (
    <div className="bg-[#F5F5F5] h-full">
      <Layout>
        <Dashboard />
      </Layout>
    </div>
  );
};

export default DashboardPage;

