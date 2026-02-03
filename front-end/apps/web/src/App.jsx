import "./App.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import { useReachable } from "./hooks/useReachable";
import FallbackLogo from "@ring/ui/FallbackLogo";
import RequireAuth from "./components/authorize/RequireAuth";
import PersistLogin from "./components/authorize/PersistLogin";
import PageLayout from "./components/layout/PageLayout";
import Layout from "./components/layout/Layout";
import "react-multi-carousel/lib/styles.css";
import "simplebar-react/dist/simplebar.min.css";

function App() {
  const connected = useReachable();

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Layout />,
        hydrateFallbackElement: <FallbackLogo />,
        children: [
          {
            path: "reset/:token?",
            handle: { title: "forgot.title" },
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
            path: "maintainance",
            lazy: async () => {
              let Maintainance = await import("./pages/Maintainance");
              return { Component: Maintainance.default };
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
            handle: { title: "welcome" },
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
                handle: { title: "payment" },
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
                    handle: { title: "store" },
                    lazy: async () => {
                      let FiltersPage = await import("./pages/FiltersPage");
                      return { Component: FiltersPage.default };
                    },
                  },
                  {
                    path: "shop",
                    handle: { title: "shop.title" },
                    lazy: async () => {
                      let Shops = await import("./pages/Shops");
                      return { Component: Shops.default };
                    },
                  },
                  {
                    path: "shop/:id",
                    handle: { title: "shop.title" },
                    lazy: async () => {
                      let ShopDetail = await import("./pages/ShopDetail");
                      return { Component: ShopDetail.default };
                    },
                  },
                  {
                    path: "product/:slug",
                    handle: { title: "product.detail" },
                    lazy: async () => {
                      let ProductDetail = await import("./pages/ProductDetail");
                      return { Component: ProductDetail.default };
                    },
                  },
                  {
                    path: "product-id/:id",
                    handle: { title: "product.detail" },
                    lazy: async () => {
                      let ProductDetail = await import("./pages/ProductDetail");
                      return { Component: ProductDetail.default };
                    },
                  },
                  {
                    path: "cart",
                    handle: { title: "cart.label" },
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
                        handle: { title: "cart.checkout" },
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
                            handle: { title: "profile.label" },
                            lazy: async () => {
                              let Profile = await import("./pages/Profile");
                              return { Component: Profile.default };
                            },
                          },
                          {
                            path: "profile/order",
                            handle: { title: "order.label" },
                            lazy: async () => {
                              let Orders = await import("./pages/Orders");
                              return { Component: Orders.default };
                            },
                          },
                          {
                            path: "profile/order/detail/:id",
                            handle: { title: "order.detail" },
                            lazy: async () => {
                              let OrderDetail = await import("./pages/OrderDetail");
                              return { Component: OrderDetail.default };
                            },
                          },
                          {
                            path: "profile/order/checkout/:id",
                            handle: { title: "order.checkout" },
                            lazy: async () => {
                              let CheckoutDetail = await import("./pages/CheckoutDetail");
                              return { Component: CheckoutDetail.default };
                            },
                          },
                          {
                            path: "profile/review",
                            handle: { title: "review.label" },
                            lazy: async () => {
                              let Reviews = await import("./pages/Reviews");
                              return { Component: Reviews.default };
                            },
                          },
                          {
                            path: "profile/coupon",
                            handle: { title: "coupon.label" },
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

  // If the server is not reachable, redirect to the maintainance page
  if (!connected) {
    router.navigate("/maintainance");
  }

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
