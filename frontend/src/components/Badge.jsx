import React from 'react';
import { CATEGORY_DEFINITIONS } from '../services/mockData';
import { 
  Cpu, 
  ShieldAlert, 
  Flame, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Archive, 
  AlertTriangle 
} from 'lucide-react';

const iconMap = {
  Cpu,
  ShieldAlert,
  Flame,
  Clock,
  BookOpen
};

export const CategoryBadge = ({ category, showIcon = true, size = 'sm' }) => {
  const meta = CATEGORY_DEFINITIONS[category] || {
    label: category?.replace(/_/g, ' ') || 'General',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'BookOpen',
    dot: 'bg-slate-400'
  };

  const IconComponent = iconMap[meta.icon] || BookOpen;

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${meta.color} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className="w-3 h-3 flex-shrink-0" />}
      <span>{meta.label}</span>
    </span>
  );
};

export const StatusBadge = ({ status, expiresAt = null }) => {
  // Check if expiring soon
  const isExpiring = Boolean(expiresAt && new Date(expiresAt) > new Date());

  if (isExpiring) {
    const daysLeft = Math.max(1, Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
    return (
      <span className="inline-flex items-center gap-1 rounded-full text-xs px-2.5 py-0.5 font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <Clock className="w-3 h-3" />
        <span>Expires in {daysLeft}d (TTL)</span>
      </span>
    );
  }

  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </span>
      );
    case 'deprecated':
      return (
        <span className="inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <Archive className="w-3 h-3 text-slate-400" />
          <span>Deprecated</span>
        </span>
      );
    case 'conflicted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Conflicted</span>
        </span>
      );
    default:
      return null;
  }
};
