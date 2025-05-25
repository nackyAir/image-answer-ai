'use client';

import { Chrome, Github } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface SocialButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function SocialButton({
  provider,
  onClick,
  disabled,
  className,
}: SocialButtonProps) {
  const configs = {
    google: {
      icon: Chrome,
      text: 'Googleでログイン',
      className:
        'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-300 transition-all duration-200',
      iconClassName: 'text-blue-500',
    },
    github: {
      icon: Github,
      text: 'GitHubでログイン',
      className:
        'bg-gray-900 border-2 border-gray-900 text-white hover:bg-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-gray-300 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-all duration-200',
      iconClassName: 'text-white',
    },
  };

  const config = configs[provider];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'h-11 w-full font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
        config.className,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={cn('mr-2 h-4 w-4', config.iconClassName)} />
      {config.text}
    </Button>
  );
}
