'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategoryTree();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasSubcategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isActive = pathname === `/categories/${category.id}`;

    return (
      <div key={category.id}>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-2 rounded-md transition-colors cursor-pointer min-w-0',
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-surface-600 hover:bg-surface-50',
            level > 0 && 'ml-3'
          )}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category.id);
              }}
              className="p-0.5 hover:bg-surface-200 rounded transition-colors flex-shrink-0"
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
          <Link
            href={`/categories/${category.id}`}
            className="flex-1 flex items-center gap-1.5 min-w-0"
          >
            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-secondary-500 flex-shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
            )}
            <span className="text-xs font-medium truncate" title={category.name}>{category.name}</span>
            {category.productCount > 0 && (
              <span className="ml-auto text-[10px] text-surface-400 flex-shrink-0">
                {category.productCount}
              </span>
            )}
          </Link>
        </div>

        {hasSubcategories && isExpanded && (
          <div className="mt-0.5">
            {category.subCategories!.map((sub) => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn('w-56 flex-shrink-0', className)}>
      <div className="bg-white rounded-xl border border-surface-200 p-3 overflow-hidden">
        <h2 className="text-sm font-semibold text-surface-900 mb-3 px-1">Categories</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          </div>
        ) : categories.length > 0 ? (
          <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto">
            {categories.map((category) => renderCategory(category))}
          </nav>
        ) : (
          <p className="text-xs text-surface-500 text-center py-4">
            No categories available
          </p>
        )}
      </div>
    </aside>
  );
}
