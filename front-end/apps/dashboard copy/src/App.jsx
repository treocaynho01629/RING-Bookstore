import "./App.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RequireAuth, PersistLogin } from "@ring/auth";
import { Layout, FallbackLogo } from "@ring/ui";
// import { useGetEnums, useReachable } from "@ring/shared";
import PageLayout from "./components/layout/PageLayout";
import "react-multi-carousel/lib/styles.css";

function App() {
  // useReachable(); //Test connection to server
  // useGetEnums();

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Layout />,
        hydrateFallbackElement: <FallbackLogo />,
        children: [
          {
            path: "unauthorized",
            lazy: async () => {
              let Unauthorized = await import("@ring/ui/Unauthorized");
              return { Component: Unauthorized.default };
            },
          },
          {
            path: "*",
            lazy: async () => {
              let Missing = await import("@ring/ui/Missing");
              return { Component: Missing.default };
            },
          },
          {
            path: "auth/login",
            lazy: async () => {
              let Login = await import("./pages/Login");
              return { Component: Login.default };
            },
          },
          {
            element: <PersistLogin />,
            children: [
              {
                element: <PageLayout />,
                children: [
                  {
                    element: <RequireAuth allowedRoles={["ROLE_SELLER", "ROLE_ADMIN", "ROLE_GUEST"]} />,
                    children: [
                      {
                        path: "",
                        lazy: async () => {
                          let Dashboard = await import("./pages/Dashboard");
                          return { Component: Dashboard.default };
                        },
                      },
                      {
                        path: "product",
                        lazy: async () => {
                          let ManageProducts = await import("./pages/ManageProducts");
                          return { Component: ManageProducts.default };
                        },
                      },
                      {
                        path: "product/:id",
                        lazy: async () => {
                          let DetailProduct = await import("./pages/DetailProduct");
                          return { Component: DetailProduct.default };
                        },
                      },
                      {
                        path: "shop",
                        lazy: async () => {
                          let ManageShops = await import("./pages/ManageShops");
                          return { Component: ManageShops.default };
                        },
                      },
                      {
                        path: "event",
                        lazy: async () => {
                          let ManageEvents = await import("./pages/ManageEvents");
                          return { Component: ManageEvents.default };
                        },
                      },
                      {
                        path: "coupon",
                        lazy: async () => {
                          let ManageCoupons = await import("./pages/ManageCoupons");
                          return { Component: ManageCoupons.default };
                        },
                      },
                      {
                        path: "order",
                        lazy: async () => {
                          let ManageOrders = await import("./pages/ManageOrders");
                          return { Component: ManageOrders.default };
                        },
                      },
                      {
                        path: "review",
                        lazy: async () => {
                          let ManageReviews = await import("./pages/ManageReviews");
                          return { Component: ManageReviews.default };
                        },
                      },
                    ],
                  },
                  {
                    element: <RequireAuth allowedRoles={["ROLE_ADMIN", "ROLE_GUEST"]} />,
                    children: [
                      {
                        path: "user",
                        lazy: async () => {
                          let ManageUsers = await import("./pages/ManageUsers");
                          return { Component: ManageUsers.default };
                        },
                      },
                      {
                        path: "user/:id",
                        lazy: async () => {
                          let DetailAccount = await import("./pages/DetailAccount");
                          return { Component: DetailAccount.default };
                        },
                      },
                      {
                        path: "auth",
                        lazy: async () => {
                          let ManageAuthorities = await import("./pages/ManageAuthorities");
                          return { Component: ManageAuthorities.default };
                        },
                      },
                      {
                        path: "misc",
                        lazy: async () => {
                          let ManageMisc = await import("./pages/ManageMisc");
                          return { Component: ManageMisc.default };
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionStatusRevalidation: true,
        v7_skipActionErrorRevalidation: true,
      },
    }
  );

  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  );
}

export default App;
