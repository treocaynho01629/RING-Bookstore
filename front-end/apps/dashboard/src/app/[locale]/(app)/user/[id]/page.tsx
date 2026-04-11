"use client";

import { useParams } from "next/navigation";
import { useGetUserQuery } from "@/features/users/usersApiSlice";
import DetailUserContent from "@/components/user/DetailUserContent";
import { CircularProgress, Box } from "@mui/material";
import { notFound } from "next/navigation";

export default function DetailAccountPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: account, isLoading, isError } = useGetUserQuery(Number(id), {
    skip: !id || isNaN(Number(id)),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || (!account && id)) {
    notFound();
  }

  return <DetailUserContent account={account ?? null} id={id} />;
}
