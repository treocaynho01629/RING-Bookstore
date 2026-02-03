"use client";

import { useParams } from "next/navigation";

// TODO: Migrate DetailAccount component from dashboard copy
// This is a placeholder page - migrate the component when ready
// Note: This route requires ROLE_ADMIN or ROLE_GUEST
export default function DetailAccountPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <h1>User Detail</h1>
      <p>User ID: {id}</p>
      <p>This page needs to be migrated from the original Vite app.</p>
    </div>
  );
}

