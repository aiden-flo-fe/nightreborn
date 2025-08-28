export interface DraggableItem {
  id: string;
  [key: string]: any;
}

export interface DraggableListProps<T extends DraggableItem> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}
