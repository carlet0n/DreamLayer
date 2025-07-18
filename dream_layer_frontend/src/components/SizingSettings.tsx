import React, { useState } from 'react';
import { Slider as ShadcnSlider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import Slider from "@/components/Slider";

interface SizingSettingsProps {
  width: number;
  height: number;
  onChange: (width: number, height: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const SizingSettings: React.FC<SizingSettingsProps> = ({
  width,
  height,
  onChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const handleWidthChange = (newWidth: number) => {
    onChange(newWidth, height);
  };

  const handleHeightChange = (newHeight: number) => {
    onChange(width, newHeight);
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Width</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            min={64}
            max={2048}
            step={64}
            value={width}
            onChange={(e) => handleWidthChange(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Height</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            min={64}
            max={2048}
            step={64}
            value={height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default SizingSettings;
