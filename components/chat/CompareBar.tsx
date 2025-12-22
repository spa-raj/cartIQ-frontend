
import { X } from 'lucide-react';
import { ChatProductDTO } from '@/lib/types';
import Button from '@/components/ui/Button';

interface CompareBarProps {
  compareProducts: ChatProductDTO[];
  onCompare: () => void;
  onRemove: (product: ChatProductDTO) => void;
  onClear: () => void;
}

const MAX_COMPARE_PRODUCTS = 2;

export function CompareBar({ compareProducts, onCompare, onRemove, onClear }: CompareBarProps) {
  if (compareProducts.length === 0) {
    return null;
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
