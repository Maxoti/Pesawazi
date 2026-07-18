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
        <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
