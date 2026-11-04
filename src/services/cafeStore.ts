/**
 * Lumina 24-Hour Cafe - Central High-Performance Store & Concurrency State Machine
 * Enterprise PostgreSQL 16+ Partitioned Storage & Redis Cluster Simulation
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * Device Fingerprint Server-Side Persistence & Zero Baseline Revenue (0.00 THB Start)
 * Non-Revenue Bot Simulation & Post-Checkout Review System
 */

import { 
  CafeTable, 
  TableSession, 
  TableActivityLog, 
  CartItem, 
  BillBreakdown, 
  PromptPayTransaction,
  ConcurrencyMetrics,
  NodeHealth,
  RevenueAnalytics,
  CustomerReview,
  ReviewAnalytics,
  BotSimulationStatus
} from '../types';
import { 
  generateCryptographicSecretCode, 
  createSessionCryptogram 
} from './cryptoService';
import { calculateBill, createPaymentTransaction, TARGET_EWALLET_ID } from './promptPayService';
import { SlipVerificationResult } from './slipVerificationService';
import { 
  getOrCreateDeviceFingerprint, 
  persistServerSession, 
  retrieveServerSession, 
  purgeServerSession 
} from './deviceSessionService';
import { getThai12pmCycleWindow, ThaiCycleWindow } from './thaiTimeService';

export const DAILY_REVENUE_TARGET = 15000; // 15,000 THB minimum daily target
const BOT_SIMULATED_TABLE_IDS = ['T03', 'T07', 'T11', 'T15', 'T19'];

// Initial 20 Tables (T01 - T20)
const INITIAL_TABLES: CafeTable[] = [
  { tableId: 'T01', name: 'Solo Focus Pod 01', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 19:40' },
  { tableId: 'T02', name: 'Solo Focus Pod 02', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 4, lastCleanedAt: '2026-10-28 18:30' },
  { tableId: 'T03', name: 'Solo Focus Pod 03', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 17:15' },
  { tableId: 'T04', name: 'Solo Focus Pod 04', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 5, lastCleanedAt: '2026-10-28 16:00' },
  { tableId: 'T05', name: 'Solo Focus Pod 05', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 19:10' },
  
  { tableId: 'T06', name: 'Duo Study Booth 06', zone: 'Collaborative Zone', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 18:45' },
  { tableId: 'T07', name: 'Duo Study Booth 07', zone: 'Collaborative Zone', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 4, lastCleanedAt: '2026-10-28 15:20' },
  { tableId: 'T08', name: 'Duo Study Booth 08', zone: 'Collaborative Zone', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 19:00' },
  { tableId: 'T09', name: 'Duo Study Booth 09', zone: 'Collaborative Zone', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 1, lastCleanedAt: '2026-10-28 14:10' },
  { tableId: 'T10', name: 'Duo Study Booth 10', zone: 'Collaborative Zone', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 19:30' },

  { tableId: 'T11', name: 'Garden Window Desk 11', zone: 'Zen Garden View', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 4, lastCleanedAt: '2026-10-28 18:00' },
  { tableId: 'T12', name: 'Garden Window Desk 12', zone: 'Zen Garden View', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 17:40' },
  { tableId: 'T13', name: 'Garden Window Desk 13', zone: 'Zen Garden View', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 16:50' },
  { tableId: 'T14', name: 'Garden Window Desk 14', zone: 'Zen Garden View', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 3, lastCleanedAt: '2026-10-28 19:15' },

  { tableId: 'T15', name: 'Quad Project Table 15', zone: 'Team Workshop Area', capacity: 4, socketCount: 8, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 1, lastCleanedAt: '2026-10-28 13:00' },
  { tableId: 'T16', name: 'Quad Project Table 16', zone: 'Team Workshop Area', capacity: 4, socketCount: 8, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 18:10' },
  { tableId: 'T17', name: 'Quad Project Table 17', zone: 'Team Workshop Area', capacity: 4, socketCount: 8, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 17:30' },
  
  { tableId: 'T18', name: 'Silent Standing Bar 18', zone: 'Silent Focus Zone', capacity: 1, socketCount: 4, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 5, lastCleanedAt: '2026-10-28 19:50' },
  { tableId: 'T19', name: 'Executive Pod 19', zone: 'VIP Soundproof Pod', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 1, lastCleanedAt: '2026-10-28 15:00' },
  { tableId: 'T20', name: 'Executive Pod 20', zone: 'VIP Soundproof Pod', capacity: 2, socketCount: 6, hasTypeC100W: true, hasErgonomicChair: true, status: 'AVAILABLE', usesToday: 2, lastCleanedAt: '2026-10-28 16:30' },
];

const INITIAL_NODES: NodeHealth[] = [
  { name: 'Auth-Node-Alpha', type: 'Auth Node', status: 'HEALTHY', latencyMs: 2.1, uptime: '99.99%', port: 8081 },
  { name: 'Order-Gateway-Go', type: 'Order Gateway Node', status: 'HEALTHY', latencyMs: 2.8, uptime: '99.98%', port: 8082 },
  { name: 'WS-Goroutines-Hub', type: 'WebSocket Node', status: 'HEALTHY', latencyMs: 1.6, uptime: '99.99%', port: 8083 },
  { name: 'Slip-Verifier-Engine', type: 'Slip Verifier Engine', status: 'HEALTHY', latencyMs: 3.4, uptime: '100%', port: 8084 },
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    reviewId: 'rev_101',
    orderNumber: 'ORD-882190',
    tableId: 'T01',
    rating: 5,
    tags: ['กาแฟหอมอร่อย', 'เน็ตเร็วมาก', 'ปลั๊กไฟสะดวก'],
    comment: 'เงียบสงบมาก กาแฟอเมริกาโน่รสชาติดี ปลั๊ก Type-C 100W ชาร์จโน้ตบุ๊กเร็วมาก',
    customerName: 'คุณณัฐพงษ์ (โต๊ะ T01)',
    createdAt: '2026-10-28T20:15:00Z',
  },
  {
    reviewId: 'rev_102',
    orderNumber: 'ORD-882175',
    tableId: 'T06',
    rating: 5,
    tags: ['บรรยากาศเงียบสงบ', 'แอร์เย็นสบาย'],
    comment: 'โต๊ะทำงานกว้างขวาง เก้าอี้ Ergonomic นั่งสบายไม่ปวดหลังเลยครับ',
    customerName: 'คุณศิริพร (โต๊ะ T06)',
    createdAt: '2026-10-28T19:30:00Z',
  },
  {
    reviewId: 'rev_103',
    orderNumber: 'ORD-882142',
    tableId: 'T11',
    rating: 5,
    tags: ['มัทฉะเข้มข้น', 'วิวสวนร่มรื่น'],
    comment: 'วิวสวน Zen สบายตา Uji Matcha เข้มข้นมาก อ่านหนังสือสอบได้ยาวๆ',
    customerName: 'คุณภัทรดนัย (โต๊ะ T11)',
    createdAt: '2026-10-28T18:45:00Z',
  },
  {
    reviewId: 'rev_104',
    orderNumber: 'ORD-882109',
    tableId: 'T02',
    rating: 4,
    tags: ['ปลั๊กไฟสะดวก', 'เปิด24ชั่วโมง'],
    comment: 'ระบบจ่ายเงินและเช็คอินสะดวกมากครับ แนะนำครัวซองต์ทรัฟเฟิล',
    customerName: 'คุณวรรณวิมล (โต๊ะ T02)',
    createdAt: '2026-10-28T17:20:00Z',
  },
];

class CafeStoreManager {
  private tables: CafeTable[] = [...INITIAL_TABLES];
  private activeSession: TableSession | null = null;
  private activityLogs: TableActivityLog[] = [];
  private cartItems: CartItem[] = [];
  private currentTransaction: PromptPayTransaction | null = null;
  
  // ZERO BASELINE REVENUE: Starts at strictly 0.00 THB with empty array
  // Only real verified customer slips increment this array!
  private settledTransactions: PromptPayTransaction[] = [];
  
  // Post-Checkout Customer Reviews
  private customerReviews: CustomerReview[] = [...INITIAL_REVIEWS];

  // Bot Simulation Module: Disabled by default to prevent client-side desync across real devices
  private botSimulation: BotSimulationStatus = {
    enabled: false,
    simulatedTables: [...BOT_SIMULATED_TABLE_IDS],
    activeBotSessions: 0,
    totalSimulatedOrders: 0,
    lastSimulatedAction: 'System Standby',
    isRevenueIsolated: true,
  };
  private botSimulationInterval: any = null;

  private listeners: Set<() => void> = new Set();
  private deviceFingerprint: string = '';
  private isAdminAuthenticated: boolean = false;

  // Multi-Architecture In-Memory Distributed Locks
  private distributedLocks: Map<string, number> = new Map();

  // Concurrency Metrics under 50,000 Users
  private metrics: ConcurrencyMetrics = {
    concurrentUsers: 50000,
    activeGoroutines: 50000,
    requestsPerSecond: 14280,
    redisCacheHitRatio: 99.4,
    p99LatencyMs: 4.8,
    isAutoRecovering: false,
    failoverRemainingSec: 0,
    nodes: [...INITIAL_NODES],
  };

  private failoverInterval: any = null;
  private eventSource: EventSource | null = null;
  private lastTablesETag: string | null = null;

  constructor() {
    this.deviceFingerprint = getOrCreateDeviceFingerprint();
    this.restoreDeviceSessionIfPresent();
    this.loadTransactionsFromStorage();
    this.startMetricsSimulation();
    this.fetchTablesFromServer();
    this.fetchTransactionsFromServer();
    this.initSSEConnection();

    // High-Frequency Real-Time Cross-Device Polling Heartbeat (1.5s interval)
    // Bandwidth Optimization: Pauses automatically when tab is hidden or backgrounded
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          this.fetchTablesFromServer();
        }
      }, 1500);

      // Periodic Thai 12:00 PM cycle countdown & rollover notification (5s interval)
      setInterval(() => {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          this.notifyListeners();
        }
      }, 5000);
    }
  }

  private loadTransactionsFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('study_cafe_settled_txs_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.settledTransactions = parsed;
        }
      }
    } catch {}
  }

  private saveTransactionsToStorage() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('study_cafe_settled_txs_v2', JSON.stringify(this.settledTransactions.slice(0, 500)));
    } catch {}
  }

  private lastTransactionsETag: string | null = null;

  public async fetchTransactionsFromServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const headers: Record<string, string> = {};
      if (this.lastTransactionsETag) {
        headers['If-None-Match'] = this.lastTransactionsETag;
      }
      const res = await fetch('/api/v1/transactions', { headers, cache: 'no-store' });
      if (res.status === 304) return;
      if (!res.ok) return;

      const newEtag = res.headers.get('ETag');
      if (newEtag) {
        this.lastTransactionsETag = newEtag;
      }

      const data = await res.json();
      if (data && Array.isArray(data.transactions) && data.transactions.length > 0) {
        const map = new Map<string, PromptPayTransaction>();
        this.settledTransactions.forEach((t) => map.set(t.transactionId, t));
        data.transactions.forEach((t: PromptPayTransaction) => {
          if (!map.has(t.transactionId)) {
            map.set(t.transactionId, t);
          }
        });
        this.settledTransactions = Array.from(map.values()).sort(
          (a, b) => new Date(b.settledAt || b.createdAt).getTime() - new Date(a.settledAt || a.createdAt).getTime()
        );
        this.saveTransactionsToStorage();
        this.notifyListeners();
      }
    } catch {}
  }

  /**
   * Fetch current table snapshot directly from HTTP API (Single Source of Truth)
   * Bandwidth & Battery Optimization: Utilizes HTTP 304 Not Modified & ETag cache validation
   */
  public async fetchTablesFromServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const headers: Record<string, string> = {};
      if (this.lastTablesETag) {
        headers['If-None-Match'] = this.lastTablesETag;
      }
      const res = await fetch('/api/v1/tables', {
        headers,
        cache: 'no-store',
      });

      // HTTP 304 Not Modified: Server state has not changed, 0 bytes body, zero parsing overhead
      if (res.status === 304) {
        return;
      }

      if (!res.ok) return;

      const newEtag = res.headers.get('ETag');
      if (newEtag) {
        this.lastTablesETag = newEtag;
      }

      const data = await res.json();
      if (data && Array.isArray(data.tables)) {
        data.tables.forEach((serverTable: any) => {
          const idx = this.tables.findIndex((t) => t.tableId === serverTable.tableId);
          if (idx !== -1) {
            const isMyTable = this.activeSession?.tableId === serverTable.tableId;
            this.tables[idx] = {
              ...this.tables[idx],
              status: serverTable.status,
              currentSessionId: isMyTable ? this.activeSession?.sessionId : serverTable.currentSessionId,
              currentSecretCode: isMyTable ? this.activeSession?.secretCode : serverTable.currentSecretCode,
            };
          }
        });
        this.notifyListeners();
      }
    } catch {
      // offline fallback
    }
  }

  /**
   * Real-Time Multi-Device State Synchronization via SSE & Redis Pub/Sub
   * Subscribes to channel 'table_updates' with sub-10ms broadcast latency
   */
  private initSSEConnection() {
    if (typeof window === 'undefined' || !window.EventSource) return;

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchTablesFromServer();
        }
      });
      window.addEventListener('focus', () => {
        this.fetchTablesFromServer();
      });
    }

    const connectSSE = () => {
      try {
        if (this.eventSource) {
          this.eventSource.close();
        }
        this.eventSource = new EventSource('/api/v1/stream');

        this.eventSource.addEventListener('table_snapshot', (e: MessageEvent) => {
          try {
            const snapshot = JSON.parse(e.data);
            if (Array.isArray(snapshot)) {
              snapshot.forEach((snapTable: any) => {
                const idx = this.tables.findIndex((t) => t.tableId === snapTable.tableId);
                if (idx !== -1) {
                  const isMyTable = this.activeSession?.tableId === snapTable.tableId;
                  this.tables[idx] = {
                    ...this.tables[idx],
                    status: snapTable.status,
                    currentSessionId: isMyTable ? this.activeSession?.sessionId : snapTable.currentSessionId,
                    currentSecretCode: isMyTable ? this.activeSession?.secretCode : snapTable.currentSecretCode,
                  };
                }
              });
              this.notifyListeners();
            }
          } catch {}
        });

        this.eventSource.addEventListener('table_updates', (e: MessageEvent) => {
          try {
            const update = JSON.parse(e.data);
            if (update && update.tableId) {
              this.handleRemoteTableUpdate(update);
            }
          } catch {}
        });

        // Real-Time Transaction Settlement Synchronization
        this.eventSource.addEventListener('transaction_settled', (e: MessageEvent) => {
          try {
            const tx = JSON.parse(e.data);
            if (tx && tx.transactionId) {
              const exists = this.settledTransactions.some((t) => t.transactionId === tx.transactionId);
              if (!exists) {
                this.settledTransactions.unshift(tx);
                this.saveTransactionsToStorage();
                this.notifyListeners();
              }
            }
          } catch {}
        });

        this.eventSource.onerror = () => {
          if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
          }
          // Reconnect with exponential retry
          setTimeout(connectSSE, 3000);
        };
      } catch {
        setTimeout(connectSSE, 4000);
      }
    };

    connectSSE();
  }

  private handleRemoteTableUpdate(payload: {
    tableId: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
    currentSessionId?: string;
    currentSecretCode?: string;
  }) {
    const idx = this.tables.findIndex((t) => t.tableId === payload.tableId);
    if (idx === -1) return;

    if (this.activeSession && this.activeSession.tableId === payload.tableId && payload.status === 'AVAILABLE') {
      this.activeSession = null;
      this.cartItems = [];
      this.currentTransaction = null;
      purgeServerSession(this.deviceFingerprint);
    }

    this.tables[idx] = {
      ...this.tables[idx],
      status: payload.status,
      currentSessionId: payload.currentSessionId,
      currentSecretCode: payload.currentSecretCode,
    };

    this.notifyListeners();
  }

  private broadcastTableChange(tableId: string, status: string, sessionId?: string, secretCode?: string) {
    if (typeof window === 'undefined') return;
    try {
      const endpoint = status === 'OCCUPIED' ? '/api/v1/tables/occupy' : '/api/v1/tables/release';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          tableId,
          status,
          sessionId,
          secretCode,
          deviceFingerprint: this.deviceFingerprint,
        }),
      })
      .then((res) => {
        if (res.ok) {
          // Immediately align with server single source of truth
          this.fetchTablesFromServer();
        }
      })
      .catch(() => {});
    } catch {}
  }

  /**
   * Device Fingerprint & Server Session Recovery
   */
  private restoreDeviceSessionIfPresent(): void {
    const saved = retrieveServerSession(this.deviceFingerprint);
    if (!saved || !saved.session) return;

    const table = this.tables.find((t) => t.tableId === saved.session.tableId);
    if (!table) return;

    this.activeSession = saved.session;
    this.cartItems = saved.cartItems || [];

    table.status = 'OCCUPIED';
    table.currentSessionId = saved.session.sessionId;
    table.currentSecretCode = saved.session.secretCode;

    this.activityLogs.unshift({
      id: `log_recover_${Date.now()}`,
      tableId: saved.session.tableId,
      sessionId: saved.session.sessionId,
      eventType: 'CHECK_IN',
      message: `กู้คืนสถานะเซสชันโต๊ะ ${saved.session.tableId} สำเร็จจาก Device Fingerprint [${this.deviceFingerprint.slice(0, 8)}...]`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * High Concurrency Background Worker Simulation (50k Users)
   */
  private startMetricsSimulation() {
    setInterval(() => {
      if (this.metrics.isAutoRecovering) return;

      const jitter = (Math.random() - 0.5) * 400;
      this.metrics.requestsPerSecond = Math.round(14200 + jitter);
      this.metrics.p99LatencyMs = Number((4.5 + Math.random() * 0.8).toFixed(1));

      this.metrics.nodes = this.metrics.nodes.map((node) => ({
        ...node,
        latencyMs: Number((node.latencyMs * 0.95 + (1.5 + Math.random() * 2) * 0.05).toFixed(1)),
      }));

      this.notifyListeners();
    }, 3000);
  }

  /**
   * BOT SIMULATION ENGINE (Concurrency & Turnover Testing)
   * Strictly isolated from Admin Revenue Dashboard:
   * Bot activity never touches settledTransactions or revenue totals!
   */
  private startBotSimulation() {
    if (this.botSimulationInterval) {
      clearInterval(this.botSimulationInterval);
    }

    this.botSimulationInterval = setInterval(() => {
      if (!this.botSimulation.enabled) return;

      // Pick one of the 5 bot tables at random
      const targetTableId = BOT_SIMULATED_TABLE_IDS[Math.floor(Math.random() * BOT_SIMULATED_TABLE_IDS.length)];
      
      // Do not interrupt the real human user's active session!
      if (this.activeSession && this.activeSession.tableId === targetTableId) {
        return;
      }

      const tableIndex = this.tables.findIndex((t) => t.tableId === targetTableId);
      if (tableIndex === -1) return;

      const table = this.tables[tableIndex];

      if (table.status === 'AVAILABLE') {
        // Bot Check-in Action
        const botSessionId = `BOT-SESS-${Date.now().toString().slice(-6)}`;
        const botPin = Math.floor(100000 + Math.random() * 900000).toString();
        
        this.tables[tableIndex] = {
          ...table,
          status: 'OCCUPIED',
          currentSessionId: botSessionId,
          currentSecretCode: botPin,
          usesToday: table.usesToday + 1,
        };

        this.botSimulation.activeBotSessions = this.tables.filter(
          (t) => BOT_SIMULATED_TABLE_IDS.includes(t.tableId) && t.status === 'OCCUPIED'
        ).length;
        this.botSimulation.lastSimulatedAction = `${targetTableId}: บอทเข้าใช้งาน (Check-in จำลอง)`;

        this.activityLogs.unshift({
          id: `log_bot_${Date.now()}`,
          tableId: targetTableId,
          sessionId: botSessionId,
          eventType: 'CHECK_IN',
          message: `[BOT LOAD TEST] จำลองการเข้าใช้งานโต๊ะ ${targetTableId} (ทดสอบโหลด Concurrency - ไม่นับเป็นรายได้)`,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Bot Checkout Action -> Return to AVAILABLE
        this.tables[tableIndex] = {
          ...table,
          status: 'AVAILABLE',
          currentSessionId: undefined,
          currentSecretCode: undefined,
          lastCleanedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        };

        this.botSimulation.totalSimulatedOrders += 1;
        this.botSimulation.activeBotSessions = this.tables.filter(
          (t) => BOT_SIMULATED_TABLE_IDS.includes(t.tableId) && t.status === 'OCCUPIED'
        ).length;
        this.botSimulation.lastSimulatedAction = `${targetTableId}: บอทจำลองเช็คเอาท์ คืนสถานะว่าง`;

        this.activityLogs.unshift({
          id: `log_bot_out_${Date.now()}`,
          tableId: targetTableId,
          eventType: 'CHECK_OUT',
          message: `[BOT LOAD TEST] บอทจำลอง Checkout โต๊ะ ${targetTableId} คืนสถานะว่างพร้อมใช้ (ระบบการเงินปลอดภัย 100%)`,
          timestamp: new Date().toISOString(),
        });
      }

      this.notifyListeners();
    }, 12000); // Trigger every 12 seconds
  }

  public toggleBotSimulation(enabled?: boolean): boolean {
    this.botSimulation.enabled = enabled !== undefined ? enabled : !this.botSimulation.enabled;
    this.notifyListeners();
    return this.botSimulation.enabled;
  }

  public getBotSimulationStatus(): BotSimulationStatus {
    return { ...this.botSimulation };
  }

  // State Subscriptions
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getTables(): CafeTable[] {
    return this.tables;
  }

  public getActiveSession(): TableSession | null {
    return this.activeSession;
  }

  public getActivityLogs(): TableActivityLog[] {
    return this.activityLogs;
  }

  public getCart(): CartItem[] {
    return this.cartItems;
  }

  public getCartItems(): CartItem[] {
    return this.cartItems;
  }

  public getCurrentTransaction(): PromptPayTransaction | null {
    return this.currentTransaction;
  }

  public getSettledTransactions(): PromptPayTransaction[] {
    return this.settledTransactions;
  }

  public getMetrics(): ConcurrencyMetrics {
    return this.metrics;
  }

  public getDeviceFingerprint(): string {
    return this.deviceFingerprint;
  }

  public getCartTotals(): BillBreakdown {
    const subtotal = this.cartItems.reduce((sum, item) => sum + item.itemSubtotal, 0);
    return calculateBill(subtotal);
  }

  /**
   * Calculates Real-Time Daily Revenue Analytics vs 15,000 THB Minimum Target
   * STRICT 12:00:00 PM THAILAND TIME (UTC+7) CUTOFF:
   * Revenue automatically resets to 0.00 THB at 12:00 PM daily.
   * Starts with zero baseline (0.00 THB) until real verified transactions arrive in the current cycle.
   * Bot orders are strictly isolated and excluded via tx.isBot !== true!
   */
  public getRevenueAnalytics(): RevenueAnalytics {
    const cycle = getThai12pmCycleWindow();

    // Only genuine customer verified transactions within the CURRENT 12:00 PM Thai cycle are calculated!
    const realTransactions = this.settledTransactions.filter(
      (tx) => !tx.isBot && tx.status === 'SETTLED' && cycle.isInCurrentCycle(tx.settledAt || tx.createdAt)
    );
    const totalSettledAmount = realTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const dailyTarget = DAILY_REVENUE_TARGET;
    const isTargetAchieved = totalSettledAmount >= dailyTarget;
    const gapOrSurplusAmount = Math.abs(dailyTarget - totalSettledAmount);
    const percentageRatio = Math.round((totalSettledAmount / dailyTarget) * 1000) / 10;
    const totalOrdersCount = realTransactions.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalSettledAmount / totalOrdersCount : 0;

    return {
      dailyTarget,
      totalSettledAmount,
      isTargetAchieved,
      gapOrSurplusAmount,
      percentageRatio,
      totalOrdersCount,
      averageOrderValue,
      cycleStartFormatted: cycle.cycleStartFormatted,
      cycleEndFormatted: cycle.cycleEndFormatted,
      nextResetFormatted: cycle.nextResetFormatted,
      remainingFormatted: cycle.remainingFormatted,
    };
  }

  // Customer Reviews & Rating System
  public getReviewAnalytics(): ReviewAnalytics {
    const totalReviews = this.customerReviews.length;
    const sumRatings = this.customerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.customerReviews.forEach((r) => {
      const star = Math.min(Math.max(Math.round(r.rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
      starDistribution[star] += 1;
    });

    return {
      averageRating,
      totalReviews,
      starDistribution,
      recentReviews: [...this.customerReviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  }

  public submitCustomerReview(data: Omit<CustomerReview, 'reviewId' | 'createdAt'>): CustomerReview {
    const newReview: CustomerReview = {
      ...data,
      reviewId: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.customerReviews.unshift(newReview);

    this.activityLogs.unshift({
      id: `log_rev_${Date.now()}`,
      tableId: data.tableId,
      eventType: 'ORDER_PLACED',
      message: `ลูกค้ารีวิวบริการ: ${data.rating} ดาว "${data.tags.join(', ')}" ${data.comment ? `(${data.comment})` : ''}`,
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners();
    return newReview;
  }

  /**
   * Acquire Distributed Lock (Simulating Redis Redlock to prevent duplicate booking)
   */
  private acquireDistributedLock(resourceKey: string, ttlMs: number = 3000): boolean {
    const now = Date.now();
    const existingLockTime = this.distributedLocks.get(resourceKey);
    if (existingLockTime && now < existingLockTime) {
      return false;
    }
    this.distributedLocks.set(resourceKey, now + ttlMs);
    return true;
  }

  private releaseDistributedLock(resourceKey: string) {
    this.distributedLocks.delete(resourceKey);
  }

  /**
   * Check in / Claim a table with Device Fingerprint & Atomic Distributed Locking
   */
  public occupyTableWithCryptographicSession(tableId: string): TableSession {
    // 1. Strict Booking Rule: A user who currently occupies/booked an active table and has not paid CANNOT book additional tables.
    if (this.activeSession && this.activeSession.status === 'ACTIVE') {
      if (this.activeSession.tableId === tableId) {
        return this.activeSession;
      }
      throw new Error(`คุณมีโต๊ะที่กำลังใช้งานอยู่แล้ว (โต๊ะ ${this.activeSession.tableId}) กรุณาชำระเงินและ Checkout ก่อนจองโต๊ะเพิ่ม`);
    }

    const lockKey = `lock:table:${tableId}`;
    if (!this.acquireDistributedLock(lockKey)) {
      throw new Error(`โต๊ะ ${tableId} กำลังถูกประมวลผลโดยคำขออื่น กรุณาลองใหม่อีกครั้ง`);
    }

    try {
      const tableIndex = this.tables.findIndex((t) => t.tableId === tableId);
      if (tableIndex === -1) {
        throw new Error(`ไม่พบโต๊ะ ${tableId} ในระบบ`);
      }

      const table = this.tables[tableIndex];
      if (table.status === 'OCCUPIED' && table.currentSessionId !== this.activeSession?.sessionId) {
        // If it was occupied by a bot, the human user takes priority!
        if (table.currentSessionId?.startsWith('BOT-SESS-')) {
          // Relinquish bot session for real customer
          this.botSimulation.lastSimulatedAction = `${tableId}: บอทยกโต๊ะให้ลูกค้าจริง`;
        } else {
          throw new Error(`โต๊ะ ${tableId} มีผู้ใช้งานอยู่แล้ว`);
        }
      }

      const secretCode = generateCryptographicSecretCode(tableId);
      const cryptogram = createSessionCryptogram(tableId, secretCode);
      const sessionId = cryptogram.sessionId;
      const hmacSignature = cryptogram.hmacSignature;

      const newSession: TableSession = {
        sessionId,
        tableId,
        secretCode,
        hmacSignature,
        status: 'ACTIVE',
        checkInAt: cryptogram.checkInAt,
        clientIp: '127.0.0.1 (Client Device)',
      };

      this.activeSession = newSession;

      // Update Table State in memory
      this.tables[tableIndex] = {
        ...table,
        status: 'OCCUPIED',
        currentSessionId: sessionId,
        currentSecretCode: secretCode,
        usesToday: table.usesToday + 1,
      };

      // Persist to simulated server storage (Redis & Postgres)
      persistServerSession(this.deviceFingerprint, newSession, this.cartItems);

      // Broadcast state update to all connected SSE clients
      this.broadcastTableChange(tableId, 'OCCUPIED', sessionId, secretCode);

      this.activityLogs.unshift({
        id: `log_${Date.now()}`,
        tableId,
        sessionId,
        eventType: 'CHECK_IN',
        message: `ลูกค้า Check-in สำเร็จ รหัสลับประจำเซสชัน: ${secretCode} (ผูกกับ Device Fingerprint: ${this.deviceFingerprint.slice(0, 8)}...)`,
        metadata: { hmac: hmacSignature },
        timestamp: new Date().toISOString(),
      });

      this.notifyListeners();
      return newSession;
    } finally {
      this.releaseDistributedLock(lockKey);
    }
  }

  /**
   * Cart Operations synced with Server-side Session
   */
  public addToCart(item: CartItem) {
    const existingIndex = this.cartItems.findIndex(
      (c) =>
        c.menuItem.id === item.menuItem.id &&
        c.size === item.size &&
        c.customization.temperature === item.customization.temperature &&
        c.customization.sweetness === item.customization.sweetness &&
        c.customization.milk === item.customization.milk &&
        c.customization.extraShot === item.customization.extraShot
    );

    if (existingIndex > -1) {
      const existing = this.cartItems[existingIndex];
      const newQty = existing.quantity + item.quantity;
      this.cartItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        itemSubtotal: existing.unitPrice * newQty,
      };
    } else {
      this.cartItems.push(item);
    }

    // Sync to persistent server session
    if (this.activeSession) {
      persistServerSession(this.deviceFingerprint, this.activeSession, this.cartItems);
      this.activityLogs.unshift({
        id: `log_${Date.now()}`,
        tableId: this.activeSession.tableId,
        sessionId: this.activeSession.sessionId,
        eventType: 'ORDER_PLACED',
        message: `เพิ่มสินค้า: ${item.menuItem.nameTh} (${item.size}) x${item.quantity}`,
        timestamp: new Date().toISOString(),
      });
    }

    this.notifyListeners();
  }

  public updateCartItemQuantity(cartItemId: string, delta: number) {
    const index = this.cartItems.findIndex((c) => c.cartItemId === cartItemId);
    if (index === -1) return;

    const item = this.cartItems[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      this.cartItems.splice(index, 1);
    } else {
      this.cartItems[index] = {
        ...item,
        quantity: newQty,
        itemSubtotal: item.unitPrice * newQty,
      };
    }

    if (this.activeSession) {
      persistServerSession(this.deviceFingerprint, this.activeSession, this.cartItems);
    }
    this.notifyListeners();
  }

  public clearCart() {
    this.cartItems = [];
    if (this.activeSession) {
      persistServerSession(this.deviceFingerprint, this.activeSession, []);
    }
    this.notifyListeners();
  }

  /**
   * Initiate PromptPay Checkout with Idempotency Key
   */
  public initiatePromptPayCheckout(): PromptPayTransaction {
    if (!this.activeSession) {
      throw new Error('กรุณาเลือกโต๊ะก่อนดำเนินการสั่งซื้อและชำระเงิน');
    }
    if (this.cartItems.length === 0) {
      throw new Error('ตะกร้าสินค้าว่างเปล่า');
    }

    const { totalAmount } = this.getCartTotals();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const tx = createPaymentTransaction(
      orderNumber,
      this.activeSession.tableId,
      totalAmount,
      TARGET_EWALLET_ID,
      this.activeSession.secretCode
    );

    this.currentTransaction = tx;

    // Update persistent server session with pending order
    persistServerSession(this.deviceFingerprint, this.activeSession, this.cartItems, orderNumber);

    this.activityLogs.unshift({
      id: `log_${Date.now()}`,
      tableId: this.activeSession.tableId,
      sessionId: this.activeSession.sessionId,
      eventType: 'PAYMENT_PENDING',
      message: `สร้าง PromptPay QR ยอดสุทธิ ฿${totalAmount.toFixed(2)} (Ref1: ${tx.ref1}, Ref2: ${tx.ref2}) รหัสคำสั่งซื้อ ${orderNumber}`,
      metadata: { txId: tx.transactionId, amount: totalAmount, ref1: tx.ref1, ref2: tx.ref2 },
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners();
    return tx;
  }

  /**
   * Automatic Checkout & Table Release upon Verified Bank Slip
   * Auto-Purges Device Session & Adds Real-time Revenue
   */
  public completeCheckoutWithVerifiedSlip(slipResult: SlipVerificationResult): {
    success: boolean;
    tableId: string;
    releasedSessionId: string;
    revokedSecretCode: string;
    receipt: PromptPayTransaction;
  } {
    if (!this.currentTransaction || !this.activeSession) {
      throw new Error('ไม่พบข้อมูลคำสั่งซื้อหรือเซสชันที่รอการชำระเงิน');
    }

    const lockKey = `lock:checkout:${this.currentTransaction.orderNumber}`;
    if (!this.acquireDistributedLock(lockKey)) {
      throw new Error('คำสั่งซื้อนี้กำลังถูกประมวลผลการเช็คเอาท์อยู่แล้ว');
    }

    try {
      const tableId = this.activeSession.tableId;
      const releasedSessionId = this.activeSession.sessionId;
      const revokedSecretCode = this.activeSession.secretCode;

      // 1. Mark Transaction as SETTLED and attach bank slip proof with Ref1 and Ref2
      const cartSnapshot = [...this.cartItems];
      const totalUnits = cartSnapshot.reduce((sum, item) => sum + item.quantity, 0);

      const settledTx: PromptPayTransaction = {
        ...this.currentTransaction,
        status: 'SETTLED',
        ref1: slipResult.ref1 || this.currentTransaction.ref1,
        ref2: slipResult.ref2 || this.currentTransaction.ref2,
        bankReferenceNo: slipResult.bankReferenceNo,
        senderBank: slipResult.senderBank,
        settledAt: new Date().toISOString(),
        isBot: false, // Genuine verified customer transaction
        items: cartSnapshot,
        totalUnits: totalUnits > 0 ? totalUnits : 1,
      };

      // Real-time addition to settled transactions and admin revenue
      this.settledTransactions.unshift(settledTx);
      this.saveTransactionsToStorage();

      // POST to server database to persist across restarts and devices
      if (typeof window !== 'undefined') {
        fetch('/api/v1/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settledTx),
        }).catch(() => {});
      }

      this.currentTransaction = null;
      this.cartItems = [];

      // 2. AUTOMATIC CHECKOUT: Flip Table Status immediately from OCCUPIED to AVAILABLE
      const tableIndex = this.tables.findIndex((t) => t.tableId === tableId);
      if (tableIndex > -1) {
        const prevTable = this.tables[tableIndex];
        this.tables[tableIndex] = {
          ...prevTable,
          status: 'AVAILABLE',
          currentSessionId: undefined,
          currentSecretCode: undefined,
          usesToday: prevTable.usesToday + 1,
          lastCleanedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        };
      }

      // Broadcast table release over SSE
      this.broadcastTableChange(tableId, 'AVAILABLE');

      // 3. AUTO-PURGE: Clean and revoke current session and purge device fingerprint from server
      this.activeSession = null;
      purgeServerSession(this.deviceFingerprint);

      // 4. Log to Audit Table (Visible ONLY in Admin Dashboard)
      this.activityLogs.unshift({
        id: `log_checkout_${Date.now()}`,
        tableId,
        sessionId: releasedSessionId,
        eventType: 'CHECK_OUT',
        message: `สคริปต์สแกนตรวจสอบสลิปผ่านสำเร็จ (Non-AI)! Ref 1: ${settledTx.ref1} | Ref 2: ${settledTx.ref2} | อ้างอิงธนาคาร: ${slipResult.bankReferenceNo} (${slipResult.senderBank}) ยอดเงิน ฿${settledTx.amount.toFixed(2)} คืนสถานะโต๊ะ ${tableId} เป็น AVAILABLE`,
        metadata: {
          ref1: settledTx.ref1,
          ref2: settledTx.ref2,
          refNo: slipResult.bankReferenceNo,
          bank: slipResult.senderBank,
          amount: settledTx.amount,
          hashMatch: slipResult.hashMatch,
          verificationEngine: slipResult.verificationEngine,
        },
        timestamp: new Date().toISOString(),
      });

      this.notifyListeners();

      return {
        success: true,
        tableId,
        releasedSessionId,
        revokedSecretCode,
        receipt: settledTx,
      };
    } finally {
      this.releaseDistributedLock(lockKey);
    }
  }

  /**
   * Force Reset Table (Manager Admin Action Only)
   */
  public adminForceResetTable(tableId: string): void {
    const tableIndex = this.tables.findIndex((t) => t.tableId === tableId);
    if (tableIndex > -1) {
      const prev = this.tables[tableIndex];
      this.tables[tableIndex] = {
        ...prev,
        status: 'AVAILABLE',
        currentSessionId: undefined,
        currentSecretCode: undefined,
        usesToday: prev.usesToday + 1,
      };
    }

    if (this.activeSession?.tableId === tableId) {
      this.activeSession = null;
      this.cartItems = [];
      this.currentTransaction = null;
      purgeServerSession(this.deviceFingerprint);
    }

    // Broadcast table reset over SSE
    this.broadcastTableChange(tableId, 'AVAILABLE');

    this.activityLogs.unshift({
      id: `log_admin_reset_${Date.now()}`,
      tableId,
      eventType: 'CODE_REVOKED',
      message: `แอดมินรีเซ็ตสถานะโต๊ะ ${tableId} เป็น AVAILABLE สำเร็จ`,
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners();
  }

  /**
   * High-Availability Stress Test: Simulate Node Failure & Trigger 15-second Auto-Recovery
   */
  public triggerFailoverRecoveryTest() {
    if (this.metrics.isAutoRecovering) return;

    this.metrics.isAutoRecovering = true;
    this.metrics.failoverRemainingSec = 15;

    this.metrics.nodes = this.metrics.nodes.map((n) =>
      n.type === 'Order Gateway Node' || n.type === 'WebSocket Node'
        ? { ...n, status: 'RECOVERING', latencyMs: 240.5 }
        : n
    );
    this.metrics.p99LatencyMs = 185.0;

    this.activityLogs.unshift({
      id: `log_failover_${Date.now()}`,
      tableId: 'SYSTEM',
      eventType: 'FAILOVER_RECOVERY',
      message: 'ตรวจพบสัญญาณเซิร์ฟเวอร์ขัดข้อง เริ่มต้นกระบวนการ Node Splitting Failover & State Auto-Recovery (เป้าหมายฟื้นตัวภายใน 15 วินาที)',
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners();

    clearInterval(this.failoverInterval);
    this.failoverInterval = setInterval(() => {
      this.metrics.failoverRemainingSec -= 1;

      if (this.metrics.failoverRemainingSec <= 0) {
        clearInterval(this.failoverInterval);
        this.metrics.isAutoRecovering = false;
        this.metrics.failoverRemainingSec = 0;
        this.metrics.p99LatencyMs = 4.2;
        this.metrics.nodes = this.metrics.nodes.map((n) => ({
          ...n,
          status: 'HEALTHY',
          latencyMs: Number((2.0 + Math.random() * 2).toFixed(1)),
        }));

        this.activityLogs.unshift({
          id: `log_recovered_${Date.now()}`,
          tableId: 'SYSTEM',
          eventType: 'FAILOVER_RECOVERY',
          message: 'ระบบ Auto-Recovery กู้คืนสำเร็จสมบูรณ์ภายใน 15 วินาที ซิงค์สถานะ Redis Cluster และ PostgreSQL ไม่มีข้อมูลสูญหาย',
          timestamp: new Date().toISOString(),
        });
      }
      this.notifyListeners();
    }, 1000);
  }

  // ==========================================
  // ADMIN AUTHENTICATION & DEMO PAYMENT MODULE
  // ==========================================

  public getIsAdminAuthenticated(): boolean {
    return this.isAdminAuthenticated;
  }

  public setAdminAuthenticated(auth: boolean): void {
    this.isAdminAuthenticated = auth;
    this.notifyListeners();
  }

  private adminSessionToken: string | null = null;

  public async verifyAndLoginAdmin(inputPassword: string): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.isAdminAuthenticated = true;
        this.adminSessionToken = data.token || 'admin-session-active';
        this.activityLogs.unshift({
          id: `log_admin_login_${Date.now()}`,
          tableId: 'SYSTEM',
          eventType: 'MAINTENANCE',
          message: 'Admin Authentication Success: Verified strictly via Server-Side Authorization',
          timestamp: new Date().toISOString(),
        });
        if (this.activityLogs.length > 100) this.activityLogs.splice(100);
        this.notifyListeners();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public logoutAdmin(): void {
    if (this.adminSessionToken) {
      fetch('/api/v1/auth/admin-logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.adminSessionToken}` },
      }).catch(() => {});
    }
    this.adminSessionToken = null;
    this.isAdminAuthenticated = false;
    this.activityLogs.unshift({
      id: `log_admin_logout_${Date.now()}`,
      tableId: 'SYSTEM',
      eventType: 'MAINTENANCE',
      message: 'Admin Logged Out: Demo Payment Mode Relocked',
      timestamp: new Date().toISOString(),
    });
    if (this.activityLogs.length > 100) this.activityLogs.splice(100);
    this.notifyListeners();
  }

  /**
   * Admin-Only Demo Payment Simulation
   * Exclusively accessible when isAdminAuthenticated is TRUE
   */
  public adminSimulateDemoPayment(): SlipVerificationResult {
    if (!this.isAdminAuthenticated) {
      throw new Error('สิทธิ์ไม่ถูกต้อง: โหมดทดลองจ่ายเงินจำลองสงวนไว้สำหรับผู้ดูแลระบบ (Admin) ที่ยืนยันตัวตนสำเร็จเท่านั้น');
    }

    const currentTx = this.currentTransaction;
    const amount = currentTx ? currentTx.amount : this.getCartTotals().totalAmount;
    const demoRef = `ADMIN-DEMO-${Date.now().toString().slice(-8)}`;

    const ref1 = currentTx?.ref1 || `D1${Date.now().toString()}${Math.floor(1000000 + Math.random() * 9000000)}`.slice(0, 22);
    const ref2 = currentTx?.ref2 || this.activeSession?.secretCode || '888999';

    return {
      isValid: true,
      bankReferenceNo: demoRef,
      senderBank: 'ธนาคารกสิกรไทย (K PLUS - Admin Demo Mode)',
      transferredAmount: amount,
      expectedAmount: amount,
      ref1,
      ref2,
      ref1Matched: true,
      ref2Matched: true,
      amountMatched: true,
      watermarkVerified: true,
      timestamp: new Date().toISOString(),
      hashMatch: true,
      verificationEngine: 'Rule-Based Deterministic Script (Non-AI / Zero External API)',
    };
  }
}

export const cafeStore = new CafeStoreManager();
