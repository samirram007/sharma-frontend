import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChallanDialog from './challan-dialog'
import type { DayBookSchema } from '../data/schema'

const { savePdf, pdfOptions, pdfText, autoTableOptions } = vi.hoisted(() => ({
  savePdf: vi.fn(),
  pdfOptions: [] as Record<string, unknown>[],
  pdfText: [] as string[],
  autoTableOptions: [] as Record<string, unknown>[],
}))
vi.mock('jspdf', () => ({
  jsPDF: class {
    constructor(options: Record<string, unknown>) {
      pdfOptions.push(options)
    }
    setFont() {}
    setFontSize() {}
    setLineWidth() {}
    setTextColor() {}
    splitTextToSize(text: string) {
      return [text]
    }
    text(value: string) {
      pdfText.push(value)
    }
    line() {}
    save(filename: string) {
      savePdf(filename)
    }
  },
}))
vi.mock('jspdf-autotable', () => ({
  default: vi.fn((_doc: unknown, options: Record<string, unknown>) => {
    autoTableOptions.push(options)
  }),
}))

const deliveryNote = {
  id: 21,
  voucherNo: 'DLNT-0021',
  voucherDate: new Date('2026-10-23T00:00:00'),
  amount: 50000,
  voucherTypeId: 2001,
  voucherEntries: [],
  company: {
    name: 'Sharma Hardware',
    phoneNo: '03512-260342',
    currency: {
      symbol: '₹',
      decimalPlaces: '2',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
    },
    address: { line1: 'N.H.-34, Mangalbari', city: 'Malda' },
  },
  party: {
    name: 'Aspira Hardware',
    line1: 'Nurpur, GTB',
    state: { name: 'West Bengal' },
    country: { name: 'India' },
  },
  voucherDispatchDetail: {
    source: 'Adina',
    destination: 'Nurpur, GTB',
    motorVehicleNo: 'WB65A9351',
    weight: 11,
    rate: 250,
    totalFare: 2750.5,
    freightCharges: 2750.5,
    unloadingCharges: 20.25,
    billingPreference: 'due',
    weightUnit: { code: 'MT', noOfDecimalPlaces: 2 },
  },
  stockJournal: {
    stockJournalEntries: [
      {
        id: 1,
        actualQuantity: 220,
        stockItem: {
          name: 'Super Cement',
          printName: 'Super Cement',
          code: 'CEM-001',
          sku: 'CEMENT-SKU',
          description: 'Premium Portland cement',
          stockUnit: { code: 'BAG' },
        },
        stockUnit: { code: 'BAG', noOfDecimalPlaces: 0 },
        stockJournalGodownEntries: [
          {
            id: 11,
            batchNo: 'BATCH-2026-A',
            actualQuantity: 220,
            serialNo: 'SER-11',
            mfgDate: new Date('2026-08-01T00:00:00'),
            expiryDate: new Date('2027-08-01T00:00:00'),
            remarks: 'Handle carefully',
            godown: { name: 'Main Godown' },
          },
        ],
      },
    ],
  },
} as unknown as DayBookSchema

describe('Day Book delivery challan preview', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePdf.mockClear()
    pdfOptions.length = 0
    pdfText.length = 0
    autoTableOptions.length = 0
  })

  it('previews the challan with delivery, party, dispatch and stock details', () => {
    render(<ChallanDialog data={deliveryNote} />)

    fireEvent.click(screen.getByRole('button', { name: /preview challan/i }))

    expect(screen.getByText('Delivery Challan Preview')).toBeTruthy()
    expect(screen.getAllByText('Sharma Hardware').length).toBeGreaterThan(0)
    expect(screen.getByText('Aspira Hardware')).toBeTruthy()
    expect(screen.getByText('WB65A9351')).toBeTruthy()
    expect(screen.getByText('Adina')).toBeTruthy()
    expect(screen.getAllByText('Nurpur, GTB').length).toBeGreaterThan(0)
    const itemTable = document.querySelector('.challan-items')
    expect(
      Array.from(itemTable?.querySelectorAll('thead th') ?? []).map(
        (header) => header.textContent,
      ),
    ).toEqual(['No. Bags / Qty', 'Particulars', 'Rate Per MT', 'Total'])
    const itemRow = itemTable?.querySelector('tbody tr')
    expect(itemRow?.children[0].textContent).toBe('220 BAG')
    expect(itemRow?.children[2].textContent).toBe('₹250.00')
    expect(itemRow?.children[3].textContent).toBe('₹2,750.50')
    const totalRow = itemTable?.querySelector('tfoot tr')
    expect(totalRow?.children[0].textContent).toBe('220 BAG')
    expect(totalRow?.children[3].textContent).toBe('₹2,750.50')
    expect(itemTable?.nextElementSibling?.textContent).toContain(
      'Mode of Payment',
    )
    const particulars = document.querySelector('.challan-item-particulars')
    expect(particulars?.textContent).toContain('Batch No.: BATCH-2026-A')
    expect(particulars?.textContent).toContain('Weight: 11.00 MT')
    expect(particulars?.textContent).toContain('Super Cement')
    expect(particulars?.textContent).toContain('Code: CEM-001')
    expect(particulars?.textContent).toContain('SKU: CEMENT-SKU')
    expect(particulars?.textContent).toContain('Premium Portland cement')
    expect(particulars?.textContent).toContain('Godown: Main Godown')
    expect(particulars?.textContent).toContain('Serial No.: SER-11')
    expect(particulars?.textContent).toContain('Handle carefully')
    expect(particulars?.querySelector('.challan-item-extra-space')).toBeTruthy()
    expect(screen.getByText('Surcharge')).toBeTruthy()
    expect(screen.getByText('Hamili')).toBeTruthy()
    const freightTable = document.querySelector('.challan-freight')
    expect(freightTable?.querySelector('caption')?.textContent).toBe(
      'FREIGHT CHARGES',
    )
    expect(
      Array.from(freightTable?.querySelectorAll('thead tr') ?? []).map((row) =>
        Array.from(row.children).map((cell) => cell.textContent),
      ),
    ).toEqual([['Particulars', 'Rs.', 'P.']])
    const freightRow = freightTable?.querySelector('tbody tr')
    expect(freightRow?.children[0].textContent).toBe('Freight')
    expect(freightRow?.children[1].textContent).toBe('2750')
    expect(freightRow?.children[2].textContent).toBe('50')
    const hamiliRow = Array.from(
      freightTable?.querySelectorAll('tbody tr') ?? [],
    ).find((row) => row.children[0].textContent === 'Hamili')
    expect(hamiliRow?.children[1].textContent).toBe('20')
    expect(hamiliRow?.children[2].textContent).toBe('25')
    const freightTotalRow = freightTable?.querySelector(
      '.challan-freight-total',
    )
    expect(freightTotalRow?.children[0].textContent).toBe('NET TOTAL')
    expect(freightTotalRow?.children[1].textContent).toBe('2750')
    expect(freightTotalRow?.children[2].textContent).toBe('50')
    expect(screen.getByText('FREIGHT CHARGES')).toBeTruthy()
    expect(
      document.querySelector('.challan-value-words')?.textContent,
    ).toContain(
      'Insured Value: ₹50,000.00 — Value in words: Rupees Fifty Thousand Only',
    )
    expect(
      document.querySelector('.challan-mode-payment')?.textContent,
    ).toContain('To be billed')
    expect(
      document.querySelector('.challan-payment-details')?.textContent,
    ).toContain('Value in words: Rupees Fifty Thousand Only')
    expect(
      Array.from(document.querySelectorAll('.challan-payment-details > *')).map(
        (element) => element.className,
      ),
    ).toEqual(['challan-mode-payment', 'challan-value-words'])
    expect(
      document.querySelector('.challan-payment-details')?.nextElementSibling
        ?.className,
    ).toBe('challan-freight-section')
    expect(screen.getByRole('button', { name: /print challan/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeTruthy()
    expect(screen.getByLabelText('Paper size').tagName).toBe('SELECT')
  })

  it('includes discount and net total in the preview and downloaded PDF', async () => {
    const discountedDeliveryNote = {
      ...deliveryNote,
      voucherDispatchDetail: {
        ...deliveryNote.voucherDispatchDetail,
        totalFare: 2800,
        freightCharges: 2750.5,
        loadingCharges: 30.45,
        unloadingCharges: 20.25,
        insuranceCharges: 4.1,
        otherCharges: 2,
        packingCharges: 3.2,
        discount: 10.5,
      },
    } as unknown as DayBookSchema
    render(<ChallanDialog data={discountedDeliveryNote} />)
    fireEvent.click(screen.getByRole('button', { name: /preview challan/i }))

    const freightTable = document.querySelector('.challan-freight')
    const discountRow = Array.from(
      freightTable?.querySelectorAll('tbody tr') ?? [],
    ).find((row) => row.children[0].textContent?.includes('Discount'))
    expect(discountRow?.children[1].textContent).toBe('− 10')
    expect(discountRow?.children[2].textContent).toBe('50')
    const netRow = freightTable?.querySelector('.challan-freight-total')
    expect(netRow?.children[1].textContent).toBe('2800')
    expect(netRow?.children[2].textContent).toBe('00')

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))
    await waitFor(() => expect(savePdf).toHaveBeenCalledOnce())
    const pdfFreightTable = autoTableOptions.find((options) =>
      JSON.stringify(options.head).includes('FREIGHT CHARGES'),
    )
    expect(pdfFreightTable?.body).toEqual(
      expect.arrayContaining([['Less: Discount', '− 10', '50']]),
    )
    expect(pdfFreightTable?.foot).toEqual([['NET TOTAL', '2800', '00']])
  })

  it('matches the Freight Receipt A4/A5 paper selector and PDF dimensions', async () => {
    render(<ChallanDialog data={deliveryNote} />)
    fireEvent.click(screen.getByRole('button', { name: /preview challan/i }))

    const paperSize = screen.getByLabelText('Paper size') as HTMLSelectElement
    expect(paperSize.value).toBe('a5-landscape')
    expect(Array.from(paperSize.options).map((option) => option.value)).toEqual(
      ['a5-landscape', 'a4-landscape', 'a5-portrait', 'a4-portrait'],
    )

    const expectedLayouts = [
      ['a5-landscape', 'landscape', [210, 148]],
      ['a4-landscape', 'landscape', [297, 210]],
      ['a5-portrait', 'portrait', [148, 210]],
      ['a4-portrait', 'portrait', [210, 297]],
    ] as const
    for (const [value, orientation, format] of expectedLayouts) {
      fireEvent.change(paperSize, { target: { value } })
      expect(paperSize.value).toBe(value)
      await waitFor(() => {
        expect(window.localStorage.getItem('print-paper-size')).toBe(
          JSON.stringify(value),
        )
      })
      pdfText.length = 0
      fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))
      await waitFor(() => {
        expect(pdfOptions).toHaveLength(
          expectedLayouts.indexOf(
            expectedLayouts.find((layout) => layout[0] === value)!,
          ) + 1,
        )
      })
      expect(pdfOptions.at(-1)).toMatchObject({
        orientation,
        unit: 'mm',
        format,
      })
      const paymentLine = pdfText.findIndex((text) =>
        text.startsWith('Mode of Payment:'),
      )
      const wordsLine = pdfText.findIndex((text) =>
        text.includes('Value in words:'),
      )
      expect(paymentLine).toBeGreaterThanOrEqual(0)
      expect(wordsLine).toBeGreaterThan(paymentLine)
      expect(
        pdfText.filter((text) => text.startsWith('Mode of Payment:')),
      ).toHaveLength(1)
      const previewStyle = document.querySelector(
        '.challan-sheet style',
      )?.textContent
      expect(previewStyle).toContain(
        `size: ${value.includes('a5') ? 'A5' : 'A4'} ${orientation};`,
      )
      expect(previewStyle).toContain(
        value.endsWith('portrait')
          ? '.challan-heading { grid-template-columns: 1fr; }'
          : '.challan-heading { display: grid; grid-template-columns: 1fr 0.8fr; border: 2px solid #111; }',
      )
      expect(previewStyle).toContain(
        value.endsWith('portrait')
          ? '.challan-freight { width: 56%; }'
          : '.challan-freight { width: 48%; border-collapse: collapse; table-layout: fixed; }',
      )
    }
    expect(savePdf).toHaveBeenCalledTimes(4)
  })

  it('lets the sections menu hide preview sections that print also omits', async () => {
    render(<ChallanDialog data={deliveryNote} />)
    fireEvent.click(screen.getByRole('button', { name: /preview challan/i }))
    fireEvent.click(screen.getByRole('button', { name: /sections/i }))

    const infoSwitch = screen.getByRole('switch', { name: 'Document Info' })
    fireEvent.click(infoSwitch)
    expect(screen.queryByText('DELIVERY CHALLAN')).toBeNull()
    expect(window.localStorage.getItem('challan-show-document-info')).toBe(
      'false',
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Items' }))
    expect(document.querySelector('.challan-items')).toBeNull()
    expect(document.querySelector('.challan-mode-payment')).toBeTruthy()
    expect(document.querySelector('.challan-value-words')).toBeTruthy()
    expect(document.querySelector('.challan-freight')).toBeTruthy()
    expect(window.localStorage.getItem('challan-show-items')).toBe('false')

    fireEvent.click(screen.getByRole('switch', { name: 'Parties' }))
    expect(document.querySelector('.challan-parties')).toBeNull()
    expect(window.localStorage.getItem('challan-show-parties')).toBe('false')

    fireEvent.click(screen.getByRole('switch', { name: 'Freight' }))
    expect(document.querySelector('.challan-freight')).toBeNull()
    expect(window.localStorage.getItem('challan-show-freight')).toBe('false')

    fireEvent.click(screen.getByRole('switch', { name: 'Authorizations' }))
    expect(document.querySelector('.challan-bottom')).toBeNull()
    expect(window.localStorage.getItem('challan-show-authorizations')).toBe(
      'false',
    )
    expect(document.querySelector('.challan-mode-payment')).toBeTruthy()
    expect(document.querySelector('.challan-value-words')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))
    await waitFor(() => expect(savePdf).toHaveBeenCalledOnce())
    expect(autoTableOptions).toHaveLength(0)
    expect(pdfText.some((text) => text.includes('DELIVERY CHALLAN'))).toBe(
      false,
    )
    expect(pdfText.some((text) => text.includes('AT OWNERS RISK'))).toBe(false)
    expect(pdfText.some((text) => text.startsWith('Mode of Payment:'))).toBe(
      true,
    )
    expect(pdfText.some((text) => text.includes('Value in words:'))).toBe(true)
  })
})
