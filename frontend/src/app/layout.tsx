import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pesawazi — Live M-Pesa Dashboard',
  description: 'Real-time Till and Paybill transaction ledger, no SMS required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <div className=" mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</div>
      </body>
    </html>
  );
}