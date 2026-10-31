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
 * Formats an EMVCo Tag-Length-Value chunk
 */
function formatTLV(tag: string, value: string): string {
  const lengthStr = value.length.toString().padStart(2, '0');
  return `${tag}${lengthStr}${value}`;
}

/**
 * Generates the official PromptPay EMVCo QR Payload with locked amount
 * @param eWalletId e.g. '004999233365393' (15 digits)
 * @param amount Total bill amount in THB
 */
export function generatePromptPayPayload(eWalletId: string, amount: number): {
  payload: string;
  crc16: string;
} {
  // Format Amount string to 2 decimal places (e.g. "140.00")
  const amountStr = amount.toFixed(2);

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

  // 7. Base Payload without checksum
  const basePayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}6304`;

  // 8. Calculate CRC16 checksum over base payload
  const crc16 = calculateCRC16(basePayload);
  const fullPayload = `${basePayload}${crc16}`;

  return {
    payload: fullPayload,
    crc16,
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
 * Creates an Idempotent Payment Transaction object
 */
export function createPaymentTransaction(
  orderNumber: string,
  tableId: string,
  amount: number,
  targetEWalletId: string = TARGET_EWALLET_ID
): PromptPayTransaction {
  const { payload, crc16 } = generatePromptPayPayload(targetEWalletId, amount);
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const idempotencyKey = `idemp_${orderNumber}_${amount.toFixed(2)}`;

  return {
    transactionId,
    idempotencyKey,
    orderNumber,
    tableId,
    targetEWalletId,
    amount,
    emvcoPayload: payload,
    crc16,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString(),
  };
}
