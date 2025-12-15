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
            'flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-surface-700 hover:bg-surface-100',
            level > 0 && 'ml-4'
          )}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category.id);
              }}
              className="p-0.5 hover:bg-surface-200 rounded transition-colors"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
          <Link
            href={`/categories/${category.id}`}
            className="flex-1 flex items-center gap-2"
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-secondary-500" />
            ) : (
              <Folder className="h-4 w-4 text-surface-400" />
            )}
            <span className="text-sm font-medium truncate">{category.name}</span>
            {category.productCount > 0 && (
              <span className="ml-auto text-xs text-surface-400">
                {category.productCount}
              </span>
            )}
          </Link>
        </div>

        {hasSubcategories && isExpanded && (
          <div className="mt-1">
            {category.subCategories!.map((sub) => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn('w-64 flex-shrink-0', className)}>
      <div className="bg-white rounded-xl border border-surface-200 p-4">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Categories</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : categories.length > 0 ? (
          <nav className="space-y-1">
            {categories.map((category) => renderCategory(category))}
          </nav>
        ) : (
          <p className="text-sm text-surface-500 text-center py-4">
            No categories available
          </p>
        )}
      </div>
    </aside>
  );
}
