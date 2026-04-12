/**
 * Tests for Identity CNI Module Types
 */

import { IdentityConfig, IdentityData, DocumentType, Region } from '@/modules/identity-cni/types';

describe('Identity CNI Types', () => {
  describe('IdentityConfig', () => {
    it('should accept valid document types', () => {
      const cniConfig: IdentityConfig = {
        documentType: 'cni' as DocumentType,
        region: 'FR' as Region,
      };
      expect(cniConfig.documentType).toBe('cni');

      const passportConfig: IdentityConfig = {
        documentType: 'passport' as DocumentType,
        region: 'EU' as Region,
      };
      expect(passportConfig.documentType).toBe('passport');
    });

    it('should accept all valid regions', () => {
      const frConfig: IdentityConfig = { documentType: 'cni', region: 'FR' };
      const euConfig: IdentityConfig = { documentType: 'cni', region: 'EU' };
      const otherConfig: IdentityConfig = { documentType: 'cni', region: 'OTHER' };

      expect(frConfig.region).toBe('FR');
      expect(euConfig.region).toBe('EU');
      expect(otherConfig.region).toBe('OTHER');
    });
  });

  describe('IdentityData', () => {
    it('should handle complete identity data', () => {
      const data: IdentityData = {
        nom: 'DUPONT',
        prenom: 'Jean',
        dateNaissance: '1990-05-15',
        dateExpiration: '2030-05-15',
        mrz: 'IDFRADUPONT<<<<<<<<<<<<<<<<<<123456',
        numeroDocument: '123456789',
        photo: null,
        lieuNaissance: 'PARIS',
        sexe: 'M',
      };

      expect(data.nom).toBe('DUPONT');
      expect(data.prenom).toBe('Jean');
      expect(data.dateNaissance).toBe('1990-05-15');
      expect(data.dateExpiration).toBe('2030-05-15');
      expect(data.mrz).toBe('IDFRADUPONT<<<<<<<<<<<<<<<<<<123456');
      expect(data.numeroDocument).toBe('123456789');
      expect(data.lieuNaissance).toBe('PARIS');
      expect(data.sexe).toBe('M');
    });

    it('should handle partial/null identity data', () => {
      const data: IdentityData = {
        nom: null,
        prenom: 'Marie',
        dateNaissance: null,
        dateExpiration: '2025-12-31',
        mrz: null,
        numeroDocument: null,
        photo: null,
        lieuNaissance: null,
        sexe: null,
      };

      expect(data.nom).toBeNull();
      expect(data.prenom).toBe('Marie');
      expect(data.dateNaissance).toBeNull();
    });

    it('should handle MRZ with line breaks', () => {
      const data: IdentityData = {
        nom: 'MARTIN',
        prenom: 'Pierre',
        dateNaissance: '1985-03-20',
        dateExpiration: '2028-03-20',
        mrz: 'P<FRA MARTIN<<PIERRE<<<<<<<<<<<<<<<<<<<<<<\n1234567890FRA850320<<<<<<<<<<<<<<<280320<<<<<<',
        numeroDocument: null,
        photo: null,
        lieuNaissance: null,
        sexe: null,
      };

      expect(data.mrz).toContain('\n');
    });
  });
});
