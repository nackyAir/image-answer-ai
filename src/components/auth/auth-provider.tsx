'use client';

import { redirect, usePathname } from 'next/navigation';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSession } from '~/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error } = useSession();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending]);

  // デバッグ情報
  useEffect(() => {
    console.log('認証状態:', {
      session,
      isPending,
      error,
      pathname,
      isLoading,
    });
  }, [session, isPending, error, pathname, isLoading]);

  // パブリックページかどうかをチェック
  const isPublicPage = pathname === '/login' || pathname === '/signup';

  // 認証が必要なページで未ログインの場合はリダイレクト
  useEffect(() => {
    if (!isLoading && !session && !isPublicPage) {
      console.log(
        '未認証でプライベートページにアクセス -> ログインページへリダイレクト'
      );
      redirect('/login');
    }
  }, [isLoading, session, isPublicPage]);

  // ログイン済みでログインページにいる場合はホームにリダイレクト
  useEffect(() => {
    if (!isLoading && session && isPublicPage) {
      console.log(
        '認証済みでパブリックページにアクセス -> ホームページへリダイレクト'
      );
      redirect('/');
    }
  }, [isLoading, session, isPublicPage]);

  const value = {
    isLoading,
    user: session?.user || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
