import React from 'react';
import { CategoryBadge, StatusBadge } from './Badge';
import { 
  User, 
  Calendar, 
  Tag, 
  Layers, 
  ArrowUpRight, 
  Sparkles, 
  ExternalLink,
  GitCommit
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const MemoryCard = ({ memory, onSelect, onSupersede }) => {
  const { openMemoryDetail } = useMemory();

  const formattedDate = new Date(memory.createdAt || memory.updatedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleClick = () => {
    if (onSelect) {
      onSelect(memory);
    } else {
      openMemoryDetail(memory);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-5 cursor-pointer text-left flex flex-col justify-between ${
        memory.status === 'deprecated'
          ? 'border-slate-200 bg-slate-50/60 opacity-80 hover:opacity-100 hover:border-slate-300'
          : 'border-slate-200/80 hover:border-brand-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={memory.category} />
            <StatusBadge status={memory.status} expiresAt={memory.expires_at} />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 group-hover:text-brand-600 transition-colors">
            <Sparkles className="w-3 h-3 text-brand-500" />
            <span>3072-dim</span>
          </div>
        </div>

        {/* Memory Title */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
          {memory.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {memory.content}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-slate-100 mt-auto">
        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {memory.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {memory.tags.length > 3 && (
              <span className="text-[11px] text-slate-400 font-medium">
                +{memory.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-[10px] flex-shrink-0">
              {memory.source ? memory.source.charAt(0).toUpperCase() : 'T'}
            </div>
            <span className="truncate max-w-[130px] font-medium text-slate-700">
              {memory.source || 'Team Member'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
