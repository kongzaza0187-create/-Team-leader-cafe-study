/**
 * Lumina 24-Hour Cafe - PromptPay EMVCo QR Code Payload Generator & CRC16 Engine
 * Complies with Bank of Thailand PromptPay Standard & EMVCo QR Specification
 * Destination E-Wallet ID: 004999233365393
 */

import QRCode from 'qrcode';
import { BillBreakdown, PromptPayTransaction } from '../types';

export const TARGET_EWALLET_ID = '004999233365393';
export const VAT_RATE = 0.07;
export const SERVICE_CHARGE_RATE = 0.05;

/**
 * Calculates bill financial totals with exact 2-decimal precision
 */
export function calculateBill(subtotal: number): BillBreakdown {
  const cleanSubtotal = Math.max(0, subtotal);
  const vatAmount = Math.round(cleanSubtotal * VAT_RATE * 100) / 100;
  const serviceChargeAmount = Math.round(cleanSubtotal * SERVICE_CHARGE_RATE * 100) / 100;
  const totalAmount = Math.round((cleanSubtotal + vatAmount + serviceChargeAmount) * 100) / 100;

  return {
    subtotal: cleanSubtotal,
    vatRate: VAT_RATE,
    vatAmount,
    serviceChargeRate: SERVICE_CHARGE_RATE,
    serviceChargeAmount,
    totalAmount,
  };
}

/**
 * Calculates CRC-16/CCITT-FALSE (Polynomial 0x1021, Initial 0xFFFF)
 */
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    crc ^= code << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates Reference 1 (Ref 1):
 * Must start with 'D1' followed by exactly 20 digits (Total length: 22 characters).
 */
export function generateRef1(orderNumber?: string): string {
  const timestampStr = Date.now().toString(); // 13 digits
  const randomSuffix = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7 digits
  const digits20 = (timestampStr + randomSuffix).slice(0, 20).padStart(20, '0');
  return `D1${digits20}`;
}

/**
 * Validates Reference 1 structure:
 * Begins with 'D1' followed by 20 numerical digits.
 */
export function isValidRef1(ref1: string): boolean {
  return /^D1\d{20}$/.test(ref1);
}

/**
 * Validates Reference 2 structure:
 * Exactly 6 numerical digits representing table booking secret code.
 */
export function isValidRef2(ref2: string): boolean {
  return /^\d{6}$/.test(ref2);
}

/**
 * Formats an EMVCo Tag-Length-Value chunk
 */
function formatTLV(tag: string, value: string): string {
  const lengthStr = value.length.toString().padStart(2, '0');
  return `${tag}${lengthStr}${value}`;
}

/**
 * Formats a Date object into YYYYMMDDHHmmss (14 digits)
 */
export function formatTimestampSeconds(d: Date = new Date()): string {
  const y = d.getFullYear().toString();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}${h}${min}${sec}`;
}

/**
 * Formats a Date object into localized Thai date-time string with seconds
 */
export function formatThaiDateTimeWithSeconds(d: Date = new Date()): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${m}/${y} เวลา ${h}:${min}:${sec} น.`;
}

/**
 * Generates the official PromptPay EMVCo QR Payload with locked amount, Ref1, Ref2, and creation timestamp
 * @param eWalletId e.g. '004999233365393' (15 digits)
 * @param amount Total bill amount in THB
 * @param ref1 Starts with 'D1' + 20 digits (22 chars)
 * @param ref2 6 digits from table booking
 * @param tableId e.g. 'T01'
 * @param createdTimestamp YYYYMMDDHHmmss (14 digits)
 */
export function generatePromptPayPayload(
  eWalletId: string,
  amount: number,
  ref1: string,
  ref2: string,
  tableId: string = 'T01',
  createdTimestamp?: string
): {
  payload: string;
  crc16: string;
  timestamp: string;
} {
  // Format Amount string to 2 decimal places (e.g. "140.00")
  const amountStr = amount.toFixed(2);
  const ts = createdTimestamp || formatTimestampSeconds();

  // 1. Tag 00: Payload Format Indicator = '01'
  const tag00 = formatTLV('00', '01');

  // 2. Tag 01: Point of Initiation Method = '12' (Dynamic QR with locked amount)
  const tag01 = formatTLV('01', '12');

  // 3. Tag 29: Merchant Account Information (PromptPay)
  // Subtag 00: AID = 'A000000677010111'
  // Subtag 03: e-Wallet ID (15 digits)
  const subTag00 = formatTLV('00', 'A000000677010111');
  const subTag03 = formatTLV('03', eWalletId);
  const merchantInfo = `${subTag00}${subTag03}`;
  const tag29 = formatTLV('29', merchantInfo);

  // 4. Tag 53: Transaction Currency (THB = 764)
  const tag53 = formatTLV('53', '764');

  // 5. Tag 54: Transaction Amount
  const tag54 = formatTLV('54', amountStr);

  // 6. Tag 58: Country Code (TH)
  const tag58 = formatTLV('58', 'TH');

  // 7. Tag 62: Additional Data Field Template
  // Subtag 01: Bill Number / Ref 1 (D1 + 20 digits)
  // Subtag 02: Reference 2 (6 digits table secret code)
  // Subtag 05: Transaction Timestamp (YYYYMMDDHHmmss - down to second)
  // Subtag 07: Terminal Label (tableId)
  const subTag01 = formatTLV('01', ref1);
  const subTag02 = formatTLV('02', ref2);
  const subTag05 = formatTLV('05', ts); // Timestamp down to seconds embedded in QR code
  const subTag07 = formatTLV('07', tableId);
  const tag62 = formatTLV('62', `${subTag01}${subTag02}${subTag05}${subTag07}`);

  // 8. Base Payload without checksum
  const basePayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}${tag62}6304`;

  // 9. Calculate CRC16 checksum over base payload
  const crc16 = calculateCRC16(basePayload);
  const fullPayload = `${basePayload}${crc16}`;

  return {
    payload: fullPayload,
    crc16,
    timestamp: ts,
  };
}

/**
 * Renders the PromptPay EMVCo Payload as high-resolution PNG Data URL
 */
export async function renderQRCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code canvas:', err);
    return '';
  }
}

/**
 * Creates an Idempotent Payment Transaction object with Ref1 (D1 + 20 digits), Ref2 (6-digit table code),
 * and precise timestamp down to the second (YYYYMMDDHHmmss) embedded in the QR payload.
 */
export function createPaymentTransaction(
  orderNumber: string,
  tableId: string,
  amount: number,
  targetEWalletId: string = TARGET_EWALLET_ID,
  secretCode?: string
): PromptPayTransaction {
  const now = new Date();
  const createdAtTimestamp = formatTimestampSeconds(now);
  const createdAtFormatted = formatThaiDateTimeWithSeconds(now);

  // Generate Ref 1 starting with 'D1' followed by 20 digits (22 characters)
  const ref1 = generateRef1(orderNumber);

  // Ref 2 is the 6-digit secret code that the table reserved
  const ref2 = secretCode ? secretCode.padStart(6, '0').slice(0, 6) : Math.floor(100000 + Math.random() * 900000).toString();

  const { payload, crc16 } = generatePromptPayPayload(
    targetEWalletId,
    amount,
    ref1,
    ref2,
    tableId,
    createdAtTimestamp
  );
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const idempotencyKey = `idemp_${orderNumber}_${amount.toFixed(2)}_${ref1}`;

  return {
    transactionId,
    idempotencyKey,
    orderNumber,
    tableId,
    targetEWalletId,
    amount,
    ref1,
    ref2,
    emvcoPayload: payload,
    crc16,
    status: 'PENDING_VERIFICATION',
    createdAt: now.toISOString(),
    createdAtTimestamp,
    createdAtFormatted,
  };
}
