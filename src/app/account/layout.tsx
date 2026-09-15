import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Account | Claypresso',
  description: 'Manage your Claypresso orders, wishlist, and profile.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
