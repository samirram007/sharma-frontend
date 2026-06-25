import type { ActiveInactiveStatus } from '@/types/active-inactive-status';
import type { PlaceType } from './schema';

export const deliveryPlaceStatusTypes = new Map<ActiveInactiveStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const placeTypes: PlaceType[] = ['source', 'destination', 'transit', 'pickup', 'drop'];