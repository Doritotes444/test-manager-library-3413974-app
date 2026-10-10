import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  UserPlus,
  ShieldCheck,
  BookMarked,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Tablero Principal', icon: LayoutDashboard },
    { id: 'books', label: 'Catálogo de Libros', icon: BookOpen },
    { id: 'members', label: 'Socios / Afiliados', icon: Users },
    { id: 'loans', label: 'Terminal de Préstamos', icon: Repeat },
    { id: 'returns', label: 'Devoluciones', icon: RotateCcw },
    { id: 'overdue', label: 'Monitor de Mora', icon: AlertTriangle, badge: 'Alertas' },
  ];

  const adminItems = [
    { id: 'reports', label: 'Reportes y Métricas', icon: BarChart3 },
    { id: 'users', label: 'Gestión de Personal', icon: UserPlus },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Operaciones
          </p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-600">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Administración
            </p>
            <div className="mt-2 space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              {isAdmin ? (
                <span className="text-emerald-600 font-medium flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-0.5" /> Administrador
                </span>
              ) : (
                <span className="text-blue-600 font-medium flex items-center">
                  <BookMarked className="h-3 w-3 mr-0.5" /> Bibliotecario
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
