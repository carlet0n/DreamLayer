import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import Slider from "./Slider";

interface OutputQuantityProps {
  batchSize: number;
  batchCount: number;
  onChange: (batchSize: number, batchCount: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const OutputQuantity: React.FC<OutputQuantityProps> = ({
  batchSize,
  batchCount,
  onChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const handleBatchSizeChange = (newSize: number) => {
    onChange(newSize, batchCount);
  };

  const handleBatchCountChange = (newCount: number) => {
    onChange(batchSize, newCount);
  };

  const getBatchCountLabel = () => {
    return `a) Batch Count | <span style='color: #64748B;'>Optimal Level: 1–3</span>`;
  };

  const getBatchSizeLabel = () => {
    return `a) Batch Size | <span style='color: #64748B;'>Optimal Level: 4–7</span>`;
  };

  return (
    <div className="space-y-4">
      {(onUndo || onRedo) && (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Button 
              onClick={onUndo}
              variant="outline"
              size="sm"
              disabled={!canUndo}
              className="text-xs px-2 py-1 h-auto flex items-center gap-1"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              onClick={onRedo}
              variant="outline"
              size="sm"
              disabled={!canRedo}
              className="text-xs px-2 py-1 h-auto flex items-center gap-1"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      <div className="hidden"><Slider
        min={1}
        max={25}
        value={batchCount}
        label={getBatchCountLabel()}
        onChange={handleBatchCountChange}
      /></div>
      
      <Slider
        min={1}
        max={8}
        value={batchSize}
        label={getBatchSizeLabel()}
        onChange={handleBatchSizeChange}
      />
    </div>
  );
};

export default OutputQuantity;
