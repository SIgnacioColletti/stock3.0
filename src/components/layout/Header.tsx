'use client';

import { useSession } from 'next-auth/react';
import { Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Botón hamburguesa - solo visible en móvil */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm lg:text-base text-gray-500">
              {session?.user?.name || session?.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Usuario */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-medium text-gray-900">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
