"use client";

import { useGetEnumsQuery } from "@ring/redux";
import { useEffect } from "react";
import { useGetBooksQuery } from "../features/books/booksApiSlice";
import { getUserRole } from "@ring/shared/enums/user";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@ring/i18n/locales";
import { useLocale } from "next-intl";
import { useGetBookQuery } from "../features/books/booksApiSlice";
import useTitle from "@ring/shared/useTitle";
import useReachable from "@ring/shared/useReachable";
import useGetEnums from "@ring/shared/useGetEnums";
import Link from "next/link";
const UserRole = getUserRole();

const Test = () => {
  // const { data, isLoading, isUninitialized, isError } = useGetEnumsQuery();
  // useReachable();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  const { data, isLoading, isUninitialized, isError, refetch } =
    useGetBooksQuery({
      page: 1,
      size: 10,
    });
  const {
    data: bookData,
    isLoading: loadBookData,
    refetch: refetchBookData,
  } = useGetBookQuery(432);

  return (
    <div>
      Testing
      <button onClick={() => refetch()}>Refetch</button>
      <p>{isLoading ? "Loading..." : data?.ids.length}</p>
      <p>{loadBookData ? "Loading book..." : bookData?.title}</p>
      <button onClick={() => refetchBookData()}>Refetch book</button>
      <select value={locale} onChange={(e) => handleChange(e.target.value)}>
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <Link href="/en">EN</Link>
      <Link href="/vi">VI</Link>
    </div>
  );
};

export default Test;
