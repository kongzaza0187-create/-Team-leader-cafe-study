/**
 * Lumina 24-Hour Study & Coffee Cafe Platform
 * Core TypeScript Definitions
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 */

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

export interface CafeTable {
  tableId: string; // T01 to T20
  name: string;
  zone: 'Silent Focus Zone' | 'Collaborative Zone' | 'Zen Garden View' | 'Team Workshop Area' | 'VIP Soundproof Pod';
  capacity: number;
  socketCount: number;
  hasTypeC100W: boolean;
  hasErgonomicChair: boolean;
  status: TableStatus;
  currentSessionId?: string;
  currentSecretCode?: string;
  usesToday: number;
  lastCleanedAt: string;
}

export type SessionStatus = 'ACTIVE' | 'CHECKED_OUT' | 'REVOKED';

export interface TableSession {
  sessionId: string;
  tableId: string;
  secretCode: string;
  hmacSignature: string;
  status: SessionStatus;
  checkInAt: string;
  checkOutAt?: string;
  clientIp: string;
  activeDurationMinutes?: number;
}

export type ActivityEventType = 
  | 'CHECK_IN' 
  | 'ORDER_PLACED' 
  | 'PAYMENT_PENDING' 
  | 'CHECK_OUT' 
  | 'CODE_REVOKED' 
  | 'FAILOVER_RECOVERY'
  | 'SLIP_VERIFIED'
  | 'MAINTENANCE';

export interface TableActivityLog {
  id: string;
  tableId: string;
  sessionId?: string;
  eventType: ActivityEventType;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface MenuItem {
  id: string;
  categoryId: 'coffee' | 'tea' | 'booster' | 'bakery' | 'bites';
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  basePriceSmall: number; // e.g. 50 for Americano
  basePriceLarge?: number; // e.g. 90 for Americano
  imageUrl?: string;
  imageBase64: string; // Base64 inline encoded image string
  isAvailable: boolean;
  hasSizeOption: boolean;
  tags?: string[];
}

export type CoffeeTemperature = 'ICED' | 'HOT';
export type SweetnessLevel = 0 | 25 | 50 | 100;
export type MilkOption = 'WHOLE' | 'OAT' | 'ALMOND';

export interface CartCustomization {
  temperature?: CoffeeTemperature;
  sweetness?: SweetnessLevel;
  milk?: MilkOption;
  extraShot?: boolean;
  specialNote?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  size: 'S' | 'L';
  unitPrice: number;
  quantity: number;
  customization: CartCustomization;
  itemSubtotal: number;
}

export interface BillBreakdown {
  subtotal: number;
  vatRate: number; // 0.07
  vatAmount: number;
  serviceChargeRate: number; // 0.05
  serviceChargeAmount: number;
  totalAmount: number;
}

export type PaymentStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'SETTLED' | 'FAILED';

export interface PromptPayTransaction {
  transactionId: string;
  idempotencyKey: string;
  orderNumber: string;
  tableId: string;
  targetEWalletId: string; // 004999233365393
  amount: number;
  ref1: string; // Begins with 'D1' followed by 20 digits (22 characters total)
  ref2: string; // 6 digits reserved by the table session
  emvcoPayload: string;
  crc16: string;
  status: PaymentStatus;
  bankReferenceNo?: string;
  senderBank?: string;
  createdAt: string;
  createdAtTimestamp?: string; // Format: YYYYMMDDHHmmss (14 digits) embedded in QR Tag 62
  createdAtFormatted?: string; // Format: DD/MM/YYYY เวลา HH:mm:ss น.
  settledAt?: string;
  isBot?: boolean; // Strictly isolated from admin revenue
  items?: CartItem[];
  totalUnits?: number;
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

export interface BarChartDataPoint {
  label: string;
  periodKey: string;
  revenue: number;
  netProfit: number;
  totalUnits: number;
  orderCount: number;
}

export interface MultiPeriodSummary {
  period: AnalyticsPeriod;
  totalRevenue: number;
  netProfit: number;
  totalUnitsSold: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  chartBars: BarChartDataPoint[];
  hasRealData: boolean;
  startDate: string;
  endDate: string;
}

export interface CustomerReview {
  reviewId: string;
  orderNumber: string;
  tableId: string;
  rating: number; // 1 to 5 stars
  tags: string[];
  comment?: string;
  customerName?: string;
  createdAt: string;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: CustomerReview[];
}

export interface BotSimulationStatus {
  enabled: boolean;
  simulatedTables: string[]; // 5 tables e.g. T03, T07, T11, T15, T19
  activeBotSessions: number;
  totalSimulatedOrders: number;
  lastSimulatedAction: string;
  isRevenueIsolated: boolean; // Always true: zero bot money in real admin ledger
}

export interface NodeHealth {
  name: string;
  type: 'Auth Node' | 'Order Gateway Node' | 'WebSocket Node' | 'Slip Verifier Engine';
  status: 'HEALTHY' | 'DEGRADED' | 'RECOVERING' | 'OFFLINE';
  latencyMs: number;
  uptime: string;
  port: number;
}

export interface ConcurrencyMetrics {
  concurrentUsers: number; // up to 50,000
  activeGoroutines: number;
  requestsPerSecond: number;
  redisCacheHitRatio: number;
  p99LatencyMs: number;
  isAutoRecovering: boolean;
  failoverRemainingSec: number;
  nodes: NodeHealth[];
}

export interface RevenueAnalytics {
  dailyTarget: number; // 15,000 THB
  totalSettledAmount: number; // Strictly starting from 0.00 THB, REAL transactions in 12:00 PM Thai cycle
  isTargetAchieved: boolean;
  gapOrSurplusAmount: number;
  percentageRatio: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  cycleStartFormatted: string; // e.g. "4 พ.ย. 12:00 น."
  cycleEndFormatted: string; // e.g. "5 พ.ย. 11:59 น."
  nextResetFormatted: string; // e.g. "ตัดยอดเวลา 12:00 น."
  remainingFormatted: string; // e.g. "07:35:12"
}

export type AppLanguage = 'th' | 'en' | 'ja' | 'pt' | 'zh';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  welcomeSub: string;
}

