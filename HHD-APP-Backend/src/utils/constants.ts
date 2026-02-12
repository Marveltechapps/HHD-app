export const ORDER_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  BAG_SCANNED: 'bag_scanned',
  PICKING: 'picking',
  COMPLETED: 'completed',
  PHOTO_VERIFIED: 'photo_verified',
  RACK_ASSIGNED: 'rack_assigned',
  HANDED_OFF: 'handed_off',
} as const;

export const ITEM_STATUS = {
  PENDING: 'pending',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  SCANNED: 'scanned',
  COMPLETED: 'completed',
} as const;

export const BAG_STATUS = {
  SCANNED: 'scanned',
  IN_USE: 'in_use',
  PHOTO_TAKEN: 'photo_taken',
  COMPLETED: 'completed',
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const USER_ROLE = {
  PICKER: 'picker',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
} as const;

export const ZONE = {
  A: 'Zone A',
  B: 'Zone B',
  C: 'Zone C',
  D: 'Zone D',
} as const;

export const PICK_ISSUE_TYPE = {
  ITEM_DAMAGED: 'ITEM_DAMAGED',
  ITEM_MISSING: 'ITEM_MISSING',
  ITEM_EXPIRED: 'ITEM_EXPIRED',
  WRONG_ITEM: 'WRONG_ITEM',
} as const;

export const INVENTORY_STATUS = {
  AVAILABLE: 'available',
  DAMAGED: 'damaged',
  EXPIRED: 'expired',
  BLOCKED: 'blocked',
  RESERVED: 'reserved',
} as const;

export const ITEM_STATUS_EXTENDED = {
  ...ITEM_STATUS,
  PICKED: 'picked',
  SHORT: 'short',
  ON_HOLD: 'on_hold',
  REASSIGNED: 'reassigned',
} as const;

export const PICK_NEXT_ACTION = {
  ALTERNATE_BIN: 'ALTERNATE_BIN',
  SKIP_ITEM: 'SKIP_ITEM',
} as const;
