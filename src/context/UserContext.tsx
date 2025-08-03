// src/context/UserContext.tsx
import { createContext, useState, useContext } from 'react';

const UserContext = createContext<{ user: User | null; setUser: (user: User | null) => void; } | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);