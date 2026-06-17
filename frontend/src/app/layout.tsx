import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { Providers } from "./providers";

export const metadata = {
  title: "MotoTech Store",
  description: "Catalogo y carrito de repuestos MotoTech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
