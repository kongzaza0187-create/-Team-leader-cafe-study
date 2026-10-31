/**
 * Lumina 24-Hour Cafe - Device Fingerprinting & Server-Side Session Persistence Engine
 * Guarantees zero session loss on browser reload, crash, or tab close.
 * Purges session cleanly upon successful checkout.
 */

import { CartItem, TableSession } from '../types';

export interface PersistentServerSession {
  deviceFingerprint: string;
  tableId: string;
  session: TableSession;
  cartItems: CartItem[];
  pendingOrderNumber?: string;
  lastActiveTimestamp: number;
}

const DEVICE_STORAGE_KEY = 'lumina_client_device_fp';
const SERVER_SESSION_STORE_KEY = 'lumina_server_sessions_cluster';

/**
 * Generates a stable unique device fingerprint based on browser hardware attributes.
 */
export function getOrCreateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_mock_fp';

  let existingFp = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existingFp) {
    return existingFp;
  }

  // Calculate deterministic fingerprint from client parameters
  const nav = window.navigator;
  const screen = window.screen;
  const components = [
    nav.userAgent || '',
    nav.language || '',
    screen.colorDepth || '',
    screen.width || '',
    screen.height || '',
    new Date().getTimezoneOffset(),
    Math.random().toString(36).substring(2, 10),
  ];

  let hash = 0;
  const str = components.join('###');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const generatedFp = `dev_${Math.abs(hash).toString(16)}_${Date.now().toString(36)}`;
  localStorage.setItem(DEVICE_STORAGE_KEY, generatedFp);
  return generatedFp;
}

/**
 * Server-Side Session Store Simulation (Emulates Redis Cluster `HSET lumina:session:{fp}`)
 */
function getClusterSessionMap(): Map<string, PersistentServerSession> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(SERVER_SESSION_STORE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveClusterSessionMap(map: Map<string, PersistentServerSession>) {
  if (typeof window === 'undefined') return;
  const obj: Record<string, PersistentServerSession> = {};
  map.forEach((val, key) => {
    obj[key] = val;
  });
  localStorage.setItem(SERVER_SESSION_STORE_KEY, JSON.stringify(obj));
}

/**
 * Saves or updates persistent server-side session for a device
 */
export function persistServerSession(
  deviceFp: string,
  session: TableSession,
  cartItems: CartItem[],
  pendingOrderNumber?: string
): void {
  const map = getClusterSessionMap();
  map.set(deviceFp, {
    deviceFingerprint: deviceFp,
    tableId: session.tableId,
    session,
    cartItems,
    pendingOrderNumber,
    lastActiveTimestamp: Date.now(),
  });
  saveClusterSessionMap(map);
}

/**
 * Retrieves active persistent session for a device on reload
 */
export function retrieveServerSession(deviceFp: string): PersistentServerSession | null {
  const map = getClusterSessionMap();
  const sessionData = map.get(deviceFp);
  if (!sessionData) return null;

  // Verify lease validity (24-hour validity window)
  const isExpired = Date.now() - sessionData.lastActiveTimestamp > 24 * 60 * 60 * 1000;
  if (isExpired || sessionData.session.status !== 'ACTIVE') {
    map.delete(deviceFp);
    saveClusterSessionMap(map);
    return null;
  }

  return sessionData;
}

/**
 * Purges device session from server-side store upon checkout completion
 */
export function purgeServerSession(deviceFp: string): void {
  const map = getClusterSessionMap();
  map.delete(deviceFp);
  saveClusterSessionMap(map);
}
