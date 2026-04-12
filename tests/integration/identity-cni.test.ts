/**
 * E2E Integration test — Identity CNI module with real WIZIDEE API
 *
 * Uses tests/data_files/cni.png and calls the live WIZIDEE API.
 * Requires credentials in .env.local.
 *
 * Run: npx jest --selectProjects integration
 *
 * Expected data (from cni.png):
 *   nom:            VAILLEUX  (OCR from nom field; may read as partial if image quality low)
 *   prenom:         ROMAIN, MATTHIEU
 *   dateNaissance:  25.05. 1986
 *   numeroDocument: 140493102878
 *   mrz line 1:     IDFRAVAILLEUX...
 *
 * Note: WIZIDEE recognition requires JPEG — PNG is converted automatically.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import { recognizeDocument, analyzeDocument } from '@/lib/wizidee';
import { extractIdentityData } from '@/modules/identity-cni/process';

const FIXTURE = path.resolve(__dirname, '../data_files/cni.png');

async function loadFixtureAsJpeg(): Promise<File> {
  // WIZIDEE recognition fails on PNG — convert to JPEG first
  const jpegBuffer = await sharp(FIXTURE).jpeg({ quality: 95 }).toBuffer();
  return new File([jpegBuffer], 'cni.jpg', { type: 'image/jpeg' });
}

describe('identity-cni — E2E with real WIZIDEE API', () => {
  it('recognizes the CNI and returns dbId + radId', async () => {
    const file = await loadFixtureAsJpeg();
    const result = await recognizeDocument(file);

    expect(result.dbId).toBeTruthy();
    expect(result.radId).toBeTruthy();
    expect(result.radId).toBe('CNIRecto');
  });

  it('extracts the expected identity fields from cni.png', async () => {
    const file = await loadFixtureAsJpeg();

    const { dbId, radId } = await recognizeDocument(file);
    const analyzeResult = await analyzeDocument(file, dbId, radId);
    const identity = extractIdentityData(analyzeResult);

    console.log('Flat fields:', JSON.stringify(analyzeResult.fields, null, 2));
    console.log('Extracted identity:', JSON.stringify(identity, null, 2));

    // Document number is unambiguous in the image
    expect(identity.numeroDocument).toBe('140493102878');

    // First name
    expect(identity.prenom).toContain('ROMAIN');
    expect(identity.prenom).toContain('MATTHIEU');

    // Date of birth
    expect(identity.dateNaissance).toMatch(/1986/);
    expect(identity.dateNaissance).toMatch(/25/);
    expect(identity.dateNaissance).toMatch(/05/);

    // MRZ confirms full surname even if OCR on nom field is partial
    expect(identity.mrz).toContain('VAILLEUX');
  });
});
