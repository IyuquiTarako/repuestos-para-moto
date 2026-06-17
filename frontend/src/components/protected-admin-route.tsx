"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
};

type Props = {
  children: ReactNode;
};

export function ProtectedAdminRoute({ children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      
      if (!parsedUser.is_admin) {
        router.push("/");
        return;
      }
      
      setUser(parsedUser);
      setLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", color: "#fff" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
}
