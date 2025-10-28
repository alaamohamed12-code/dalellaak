"use client";
import { ReactNode } from 'react';
import { useAdminPermissions, AdminPermissions } from '@/hooks/useAdminPermissions';

interface PermissionButtonProps {
  children: ReactNode;
  resource: keyof AdminPermissions;
  action: 'view' | 'create' | 'update' | 'delete';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export function PermissionButton({ 
  children, 
  resource, 
  action,
  className = '',
  onClick,
  disabled = false,
  title
}: PermissionButtonProps) {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission(resource, action)) {
    return null; // إخفاء الزر إذا لم يكن لديه صلاحية
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}

interface PermissionElementProps {
  children: ReactNode;
  resource: keyof AdminPermissions;
  action: 'view' | 'create' | 'update' | 'delete';
}

export function PermissionElement({ children, resource, action }: PermissionElementProps) {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission(resource, action)) {
    return null; // إخفاء العنصر إذا لم يكن لديه صلاحية
  }

  return <>{children}</>;
}
