import PageLayout from "@/components/layout/PageLayout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  return <PageLayout>{children}</PageLayout>;
}
