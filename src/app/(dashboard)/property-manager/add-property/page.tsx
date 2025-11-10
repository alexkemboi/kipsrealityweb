'use client';

import React, { Suspense } from 'react';
import PropertyForm from '@/components/website/PropertyManager/RegisterPropertyForm';

export default function AddProperty() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <PropertyForm />
    </Suspense>
  );
}
