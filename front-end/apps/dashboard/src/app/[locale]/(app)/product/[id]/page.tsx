"use client";

import { useParams } from "next/navigation";

// TODO: Migrate DetailProduct component from dashboard copy
// This is a placeholder page - migrate the component when ready
export default function DetailProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <h1>Product Detail</h1>
      <p>Product ID: {id}</p>
      <p>This page needs to be migrated from the original Vite app.</p>
    </div>
  );
}

