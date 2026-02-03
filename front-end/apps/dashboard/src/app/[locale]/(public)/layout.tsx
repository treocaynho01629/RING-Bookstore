interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: Readonly<PublicLayoutProps>) {
  return <div>{children}</div>;
}
