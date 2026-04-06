import React, { useState, useRef, useCallback } from "react";

interface DragPosition {
  x: number;
  y: number;
}

interface UseDragOptions {
  initialPosition?: DragPosition;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

export function useDrag({
  initialPosition = { x: 0, y: 0 },
  bounds,
}: UseDragOptions = {}) {
  const [position, setPosition] = useState<DragPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setHasMoved(false);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      let newX = e.clientX - dragStartRef.current.x;
      let newY = e.clientY - dragStartRef.current.y;

      // Check if mouse has moved significantly (more than 5 pixels)
      const deltaX = Math.abs(newX - position.x);
      const deltaY = Math.abs(newY - position.y);
      if (deltaX > 5 || deltaY > 5) {
        setHasMoved(true);
      }

      // Apply bounds if provided
      if (bounds) {
        if (bounds.minX !== undefined) newX = Math.max(newX, bounds.minX);
        if (bounds.maxX !== undefined) newX = Math.min(newX, bounds.maxX);
        if (bounds.minY !== undefined) newY = Math.max(newY, bounds.minY);
        if (bounds.maxY !== undefined) newY = Math.min(newY, bounds.maxY);
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging, bounds, position.x, position.y]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Prevent text selection while dragging

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
    hasMoved,
  };
}
