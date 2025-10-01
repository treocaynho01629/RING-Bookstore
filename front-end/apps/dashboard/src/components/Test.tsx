"use client";

import { useGetEnumsQuery } from "@ring/redux";
import { useEffect } from "react";
import { useGetBooksQuery } from "../features/books/booksApiSlice";
import { useReachable, useTitle, getUserRole } from "@ring/shared";

const UserRole = getUserRole();

const Test = () => {
  // const { data, isLoading, isUninitialized, isError } = useGetEnumsQuery();
  // useReachable();
  const { data, isLoading, isUninitialized, isError, refetch } =
    useGetBooksQuery({
      page: 1,
      size: 10,
    });

  return (
    <div>
      Testing
      <button onClick={() => refetch()}>Refetch</button>
      <p>{isLoading ? "Loading..." : data?.ids.length}</p>
    </div>
  );
};

export default Test;
