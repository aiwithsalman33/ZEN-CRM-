import React, { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, closestCorners,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KanbanColumn {
  key: string;
  title: string;
  accent?: string;
  subtitle?: React.ReactNode;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  itemKey: (item: T) => string;
  itemColumn: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onMove: (itemId: string, toColumn: string) => void;
  onAddCard?: (column: string) => void;
}

const DraggableCard: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn('touch-none cursor-grab active:cursor-grabbing', isDragging && 'opacity-40')}
    >
      {children}
    </div>
  );
};

const DroppableColumn: React.FC<{ id: string; children: React.ReactNode; isOver: boolean }> = ({ id, children, isOver }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn('flex-1 flex flex-col gap-2.5 p-2 rounded-xl transition-colors min-h-[120px]', isOver ? 'bg-primary-light' : 'bg-transparent')}>
      {children}
    </div>
  );
}

export function KanbanBoard<T>({ columns, items, itemKey, itemColumn, renderCard, onMove, onAddCard }: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = (key: string) => items.filter((it) => itemColumn(it) === key);
  const activeItem = activeId ? items.find((it) => itemKey(it) === activeId) : null;

  const onStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onEnd = (e: DragEndEvent) => {
    const id = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    if (over && columns.some((c) => c.key === over)) {
      const item = items.find((it) => itemKey(it) === id);
      if (item && itemColumn(item) !== over) onMove(id, over);
    }
    setActiveId(null);
    setOverCol(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onStart}
      onDragOver={(e) => setOverCol(e.over ? String(e.over.id) : null)}
      onDragEnd={onEnd}
      onDragCancel={() => { setActiveId(null); setOverCol(null); }}
    >
      <div className="flex gap-3 overflow-x-auto pb-3 items-start">
        {columns.map((col) => {
          const colItems = grouped(col.key);
          return (
            <div key={col.key} className="w-72 shrink-0 flex flex-col card !p-0 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-line" style={{ borderTop: `3px solid ${col.accent ?? '#5B4FE8'}` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-ink truncate">{col.title}</span>
                  <span className="text-xs font-medium text-muted bg-bg rounded-full px-2 py-0.5 shrink-0">{colItems.length}</span>
                </div>
                {col.subtitle && <span className="text-xs font-semibold text-muted shrink-0">{col.subtitle}</span>}
              </div>
              <DroppableColumn id={col.key} isOver={overCol === col.key}>
                {colItems.map((it) => (
                  <DraggableCard key={itemKey(it)} id={itemKey(it)}>{renderCard(it)}</DraggableCard>
                ))}
                {colItems.length === 0 && <div className="text-xs text-muted text-center py-6">Drop here</div>}
              </DroppableColumn>
              {onAddCard && (
                <button onClick={() => onAddCard(col.key)} className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted hover:text-primary hover:bg-bg py-2.5 border-t border-line transition-colors">
                  <Plus size={14} /> Add card
                </button>
              )}
            </div>
          );
        })}
      </div>
      <DragOverlay>{activeItem ? <div className="rotate-2 w-72">{renderCard(activeItem)}</div> : null}</DragOverlay>
    </DndContext>
  );
}
