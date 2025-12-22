
import { X, Scale } from 'lucide-react';
import { ChatProductDTO } from '@/lib/types';
import Button from '@/components/ui/Button';

interface CompareBarProps {
  compareProducts: ChatProductDTO[];
  onCompare: () => void;
  onRemove: (product: ChatProductDTO) => void;
  onClear: () => void;
  compact?: boolean;
}

const MAX_COMPARE_PRODUCTS = 2;

export function CompareBar({ compareProducts, onCompare, onRemove, onClear, compact = false }: CompareBarProps) {
  if (compareProducts.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-amber-50 border-t border-amber-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Scale className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
              {compareProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-1 bg-white rounded px-1.5 py-0.5 text-xs border border-amber-200 min-w-0"
                >
                  <span className="truncate max-w-[60px]">{product.name}</span>
                  <button
                    onClick={() => onRemove(product)}
                    className="text-surface-400 hover:text-surface-600 shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {compareProducts.length < MAX_COMPARE_PRODUCTS && (
                <span className="text-xs text-amber-600 shrink-0">+1</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onClear}
              className="text-xs text-surface-500 hover:text-surface-700 px-1"
            >
              Clear
            </button>
            <button
              onClick={onCompare}
              disabled={compareProducts.length !== MAX_COMPARE_PRODUCTS}
              className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-[72px] z-10 bg-amber-50 border-t border-amber-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-semibold text-sm text-amber-700 shrink-0">Compare:</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {compareProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-1.5 bg-white rounded-md pl-2 pr-1 py-1 text-sm border border-amber-200"
              >
                <span className="truncate max-w-[120px] text-surface-700">{product.name}</span>
                <button
                  onClick={() => onRemove(product)}
                  className="p-0.5 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {compareProducts.length < MAX_COMPARE_PRODUCTS && (
              <span className="text-amber-600 text-sm">Select one more to compare</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-sm text-surface-500 hover:text-surface-700"
          >
            Clear
          </button>
          <Button
            size="sm"
            variant="primary"
            onClick={onCompare}
            disabled={compareProducts.length !== MAX_COMPARE_PRODUCTS}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
