import "./App.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import useReachable from "@ring/shared/useReachable";
import useGetEnums from "@ring/shared/useGetEnums";
import FallbackLogo from "@ring/ui/FallbackLogo";
import RequireAuth from "./components/authorize/RequireAuth";
import PersistLogin from "./components/authorize/PersistLogin";
import PageLayout from "./components/layout/PageLayout";
import Layout from "./components/layout/Layout";
import "react-multi-carousel/lib/styles.css";
import "simplebar-react/dist/simplebar.min.css";

function App() {
  useReachable(import.meta.env.VITE_API_URL); // Test connection to server
  useGetEnums();

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Layout />,
        hydrateFallbackElement: <FallbackLogo />,
        children: [
          {
            path: "reset/:token?",
            lazy: async () => {
              let ResetPage = await import("./pages/ResetPage");
              return { Component: ResetPage.default };
            },
          },
          {
            path: "unauthorized",
            lazy: async () => {
              let Unauthorized = await import("./pages/Unauthorized");
              return { Component: Unauthorized.default };
            },
          },
          {
            path: "*",
            lazy: async () => {
              let Missing = await import("./pages/Missing");
              return { Component: Missing.default };
            },
          },
          {
            path: "auth/:tab",
            lazy: async () => {
              let AuthPage = await import("./pages/AuthPage");
              return { Component: AuthPage.default };
            },
          },
          {
            element: <PersistLogin />,
            children: [
              {
                path: "payment/:id?",
                lazy: async () => {
                  let Payment = await import("./pages/Payment");
                  return { Component: Payment.default };
                },
              },
              {
                element: <PageLayout />,
                children: [
                  {
                    path: "/",
                    lazy: async () => {
                      let Home = await import("./pages/Home");
                      return { Component: Home.default };
                    },
                  },
                  {
                    path: "store/:cSlug?",
                    lazy: async () => {
                      let FiltersPage = await import("./pages/FiltersPage");
                      return { Component: FiltersPage.default };
                    },
                  },
                  {
                    path: "shop",
                    lazy: async () => {
                      let Shops = await import("./pages/Shops");
                      return { Component: Shops.default };
                    },
                  },
                  {
                    path: "shop/:id",
                    lazy: async () => {
                      let ShopDetail = await import("./pages/ShopDetail");
                      return { Component: ShopDetail.default };
                    },
                  },
                  {
                    path: "product/:slug",
                    lazy: async () => {
                      let ProductDetail = await import("./pages/ProductDetail");
                      return { Component: ProductDetail.default };
                    },
                  },
                  {
                    path: "product-id/:id",
                    lazy: async () => {
                      let ProductDetail = await import("./pages/ProductDetail");
                      return { Component: ProductDetail.default };
                    },
                  },
                  {
                    path: "cart",
                    lazy: async () => {
                      let Cart = await import("./pages/Cart");
                      return { Component: Cart.default };
                    },
                  },
                  {
                    element: <RequireAuth allowedRoles={["ROLE_USER", "ROLE_SELLER", "ROLE_ADMIN", "ROLE_GUEST"]} />,
                    children: [
                      {
                        path: "checkout",
                        lazy: async () => {
                          let Checkout = await import("./pages/Checkout");
                          return { Component: Checkout.default };
                        },
                      },
                      {
                        lazy: async () => {
                          let ProfileLayout = await import("./components/layout/ProfileLayout");
                          return { Component: ProfileLayout.default };
                        },
                        children: [
                          {
                            path: "profile/detail/:tab?",
                            lazy: async () => {
                              let Profile = await import("./pages/Profile");
                              return { Component: Profile.default };
                            },
                          },
                          {
                            path: "profile/order",
                            lazy: async () => {
                              let Orders = await import("./pages/Orders");
                              return { Component: Orders.default };
                            },
                          },
                          {
                            path: "profile/order/detail/:id",
                            lazy: async () => {
                              let OrderDetail = await import("./pages/OrderDetail");
                              return { Component: OrderDetail.default };
                            },
                          },
                          {
                            path: "profile/order/checkout/:id",
                            lazy: async () => {
                              let CheckoutDetail = await import("./pages/CheckoutDetail");
                              return { Component: CheckoutDetail.default };
                            },
                          },
                          {
                            path: "profile/review",
                            lazy: async () => {
                              let Reviews = await import("./pages/Reviews");
                              return { Component: Reviews.default };
                            },
                          },
                          {
                            path: "profile/coupon",
                            lazy: async () => {
                              let Coupons = await import("./pages/Coupons");
                              return { Component: Coupons.default };
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
