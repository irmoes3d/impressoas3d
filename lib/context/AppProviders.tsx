"use client";

import { CartProvider } from "./CartContext";
import { FavoritesProvider } from "./FavoritesContext";
import { AuthProvider } from "./AuthContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>{children}</CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
