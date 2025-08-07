// src/context/UserContext.tsx
import { createContext, useState, useContext } from 'react';

/** Опишите ровно те поля, которые реально нужны приложению */
interface User {
  id: string;
  username: string;
  // email?: string;
  // avatarUrl?: string;
}

type Ctx = {
  user: User | null;
  setUser: (user: User | null) => void;
} | null;

const UserContext = createContext<Ctx>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

/** Хук со страховкой: бросит исключение, если забыли обернуть в <UserProvider> */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within <UserProvider>');
  return ctx;
}
