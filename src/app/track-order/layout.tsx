import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | Claypresso',
  description: 'Track your handmade Claypresso polymer clay parcel with your order number and contact information.',
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
