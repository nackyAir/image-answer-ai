'use client';

import { LogOut } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { signOut } from '~/lib/auth-client';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} className={className}>
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  );
}
