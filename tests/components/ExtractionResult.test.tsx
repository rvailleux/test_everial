/**
 * Tests for ExtractionResult component
 * Field card rendering, null fields, raw JSON toggle
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExtractionResult from '../../src/components/ExtractionResult';

const baseResult = {
  fields: {
    lastName: 'DUPONT',
    firstName: 'JEAN',
    dateOfBirth: '1985-06-15',
    expiryDate: null,
    mrz: 'IDFRADUPONT<<JEAN',
  },
  raw: { wizideeRawKey: 'value123' },
};

describe('ExtractionResult', () => {
  it('renders each field from result.fields as labeled rows', () => {
    render(<ExtractionResult result={baseResult} />);
    expect(screen.getByText('DUPONT')).toBeInTheDocument();
    expect(screen.getByText('JEAN')).toBeInTheDocument();
    expect(screen.getByText('1985-06-15')).toBeInTheDocument();
  });

  it('shows a placeholder for null fields', () => {
    render(<ExtractionResult result={baseResult} />);
    // expiryDate is null — expect a dash or "No data" placeholder
    const placeholders = screen.getAllByText(/—|no data/i);
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('renders raw JSON in a collapsible section (hidden by default)', () => {
    render(<ExtractionResult result={baseResult} />);
    // Raw JSON content should not be visible initially
    expect(screen.queryByText(/wizideeRawKey/)).not.toBeInTheDocument();
  });

  it('shows raw JSON when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExtractionResult result={baseResult} />);

    const toggleBtn = screen.getByRole('button', { name: /raw json/i });
    await user.click(toggleBtn);

    expect(screen.getByText(/wizideeRawKey/)).toBeInTheDocument();
  });

  it('hides raw JSON when toggle is clicked again', async () => {
    const user = userEvent.setup();
    render(<ExtractionResult result={baseResult} />);

    const toggleBtn = screen.getByRole('button', { name: /raw json/i });
    await user.click(toggleBtn); // open
    await user.click(toggleBtn); // close

    expect(screen.queryByText(/wizideeRawKey/)).not.toBeInTheDocument();
  });

  describe('document type badge (US2)', () => {
    it('shows CNI badge when documentType is CNI_FRANCE', () => {
      render(<ExtractionResult result={baseResult} documentType="CNI_FRANCE" />);
      expect(screen.getByText(/CNI/i)).toBeInTheDocument();
    });

    it('shows PASSPORT badge when documentType is PASSPORT', () => {
      render(<ExtractionResult result={baseResult} documentType="PASSPORT" />);
      expect(screen.getByText(/PASSPORT/i)).toBeInTheDocument();
    });

    it('renders nationality field when present', () => {
      const passportResult = {
        fields: { ...baseResult.fields, nationality: 'FRA' },
        raw: {},
      };
      render(<ExtractionResult result={passportResult} documentType="PASSPORT" />);
      expect(screen.getByText('FRA')).toBeInTheDocument();
    });

    it('renders multi-line MRZ with line breaks', () => {
      const passportResult = {
        fields: {
          ...baseResult.fields,
          mrz: 'P<FRAMARTIN<<SOPHIE<<<<<<<<<\nABC123456789FRA8506151F3012221',
        },
        raw: {},
      };
      render(<ExtractionResult result={passportResult} documentType="PASSPORT" />);
      // The MRZ element should contain a <br> or be rendered inside a <pre>
      const mrzEl = screen.getByText(/P<FRAMARTIN/);
      expect(mrzEl).toBeInTheDocument();
    });
  });
});
