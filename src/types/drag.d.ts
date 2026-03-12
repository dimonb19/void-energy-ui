type DropMode = 'inside' | 'between';
type DropPosition = 'inside' | 'before' | 'after';
type DropAxis = 'vertical' | 'horizontal';

interface DragDetail {
  /** Source draggable ID */
  id: string;
  /** Transfer payload */
  data: unknown;
  /** Group name */
  group: string | undefined;
  /** Source element */
  source: HTMLElement;
  /** Current pointer position */
  x: number;
  y: number;
}

interface HoverDetail extends DragDetail {
  /** Hovered drop target */
  target: HTMLElement;
  /** Optional drop target identifier */
  targetId: string | undefined;
  /** Resolved drop position */
  position: DropPosition;
}

interface DragEndDetail extends DragDetail {
  /** Whether the drag was dropped on a valid target */
  dropped: boolean;
  /** The drop target element (if dropped) */
  target: HTMLElement | null;
  /** Optional drop target identifier */
  targetId?: string;
  /** Resolved drop position */
  position?: DropPosition;
}

interface DropDetail extends HoverDetail {}

interface DragEndResult {
  dropped: boolean;
  target: HTMLElement | null;
  targetId?: string;
  position?: DropPosition;
  x: number;
  y: number;
}

interface DropTargetRegistration {
  id?: string;
  group?: string;
  mode?: DropMode;
  axis?: DropAxis;
  accepts?: (data: unknown, sourceId: string) => boolean;
  onDragEnter?: (detail: HoverDetail) => void;
  onDragLeave?: (detail: HoverDetail) => void;
  onDrop?: (detail: DropDetail) => void;
  disabled?: boolean;
}

interface CompatibleTarget {
  element: HTMLElement;
  config: DropTargetRegistration;
}

interface DraggableOptions {
  /** Unique identifier for this draggable item */
  id: string;
  /** Data payload transferred on drop */
  data?: unknown;
  /** Group name — only drops onto matching group */
  group?: string;
  /** Axis constraint: 'both' | 'x' | 'y' (default: 'both') */
  axis?: 'both' | 'x' | 'y';
  /** CSS selector — only start drag from this child element */
  handle?: string;
  /** Disable dragging */
  disabled?: boolean;
  /** Callback when drag starts */
  onDragStart?: (detail: DragDetail) => void;
  /** Callback during drag (rAF-throttled) */
  onDragMove?: (detail: DragDetail) => void;
  /** Callback when drag ends (drop or cancel) */
  onDragEnd?: (detail: DragEndDetail) => void;
}

interface DropTargetOptions {
  /** Optional identifier for consumers who need explicit reorder metadata */
  id?: string;
  /** Group name — accepts draggables from matching group */
  group?: string;
  /** Drop mode: 'inside' for zone drops, 'between' for sortable insertion */
  mode?: DropMode;
  /** Axis used to resolve between-item insertion */
  axis?: DropAxis;
  /** Fine-grained accept predicate beyond group matching */
  accepts?: (data: unknown, sourceId: string) => boolean;
  /** Callback when a valid draggable enters */
  onDragEnter?: (detail: HoverDetail) => void;
  /** Callback when a valid draggable leaves */
  onDragLeave?: (detail: HoverDetail) => void;
  /** Callback when a draggable is dropped here */
  onDrop?: (detail: DropDetail) => void;
  /** Disable this drop target */
  disabled?: boolean;
}

interface ReorderRequest {
  /** Moved item identifier */
  id: string;
  /** Item the drop was resolved against */
  targetId: string;
  /** Placement relative to targetId */
  position: Extract<DropPosition, 'before' | 'after'>;
  /** Original index in the input array before the move */
  fromIndex: number;
  /** Final index in the reordered array after the move */
  toIndex: number;
  /** Immediate predecessor after the move */
  previousId: string | null;
  /** Immediate successor after the move */
  nextId: string | null;
  /** Full ordered ID list for backends that persist the canonical order */
  orderedIds: string[];
}

interface ReorderChange<T extends { id: string }> {
  /** Reordered collection */
  items: T[];
  /** The item that moved */
  item: T;
  /** Backend-ready reorder payload */
  request: ReorderRequest;
}
