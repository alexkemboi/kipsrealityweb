"use client";

import React, { useState } from "react";
import {Input} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/website/Navbar";
import CreateListingPage from "@/components/website/marketplace/ListingForm";

export default function CreateListingClient() {
  

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">

      <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Create <span className="text-gradient-primary">Listing</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Fill in the details below to create a new marketplace listing and reach potential buyers or renters today.
          </p>
        </div>
    
    </section>
<CreateListingPage/>    
      </div>

  );
}
