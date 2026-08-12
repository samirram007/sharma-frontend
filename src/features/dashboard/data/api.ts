import { getData } from '@/utils/dataClient'

const API_PATH = '/dashboard'

export interface DashboardSummary {
  transporterCount: number
  distributorCount: number
  zoneCount: number
  godownCount: number
  userCount: number
  freightCount: number
  freightTotalFare: number
  deliveryNoteCount: number
  receiptNoteCount: number
  paymentCount: number
  paymentTotal: number
  currentFiscalYear: string | null
}

export interface ZoneWiseDatum {
  zoneId: number | null
  zoneName: string
  zoneCode: string | null
  totalEntries: number
  totalInwardQuantity: number
  totalOutwardQuantity: number
  totalClosingQuantity: number
  totalAmount: number
}

export interface GodownWiseDatum {
  godownId: number
  godownName: string
  godownCode: string
  totalEntries: number
  totalInwardQuantity: number
  totalOutwardQuantity: number
  totalClosingQuantity: number
  totalAmount: number
}

export interface TransporterWiseDatum {
  transporterName: string
  vehicleNumber: string | null
  totalVouchers: number
  totalQuantity: number
  totalAmount: number
}

export interface UserWiseDatum {
  userId: number | null
  userName: string
  totalVouchers: number
  delivery_notes: number
  receipt_notes: number
  freights: number
  total_amount: number
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const envelope = (await getData(`${API_PATH}/summary`)) as {
    data?: Partial<DashboardSummary>
  }
  const s = envelope?.data ?? {}

  return {
    transporterCount: num(s.transporterCount),
    distributorCount: num(s.distributorCount),
    zoneCount: num(s.zoneCount),
    godownCount: num(s.godownCount),
    userCount: num(s.userCount),
    freightCount: num(s.freightCount),
    freightTotalFare: num(s.freightTotalFare),
    deliveryNoteCount: num(s.deliveryNoteCount),
    receiptNoteCount: num(s.receiptNoteCount),
    paymentCount: num(s.paymentCount),
    paymentTotal: num(s.paymentTotal),
    currentFiscalYear: s.currentFiscalYear ?? null,
  }
}

export async function fetchZoneWiseDashboard(): Promise<ZoneWiseDatum[]> {
  const envelope = (await getData(`${API_PATH}/zone_wise`)) as {
    data?: unknown[]
  }
  return (envelope?.data ?? []).map((item) => {
    const row = (item ?? {}) as Record<string, unknown>

    return {
      zoneId: row.zoneId ? Number(row.zoneId) : null,
      zoneName: String(row.zoneName ?? 'Unmapped'),
      zoneCode: row.zoneCode ? String(row.zoneCode) : null,
      totalEntries: num(row.totalEntries),
      totalInwardQuantity: num(row.totalInwardQuantity),
      totalOutwardQuantity: num(row.totalOutwardQuantity),
      totalClosingQuantity: num(row.totalClosingQuantity),
      totalAmount: num(row.totalAmount),
    }
  })
}

export async function fetchGodownWiseDashboard(): Promise<GodownWiseDatum[]> {
  const envelope = (await getData(`${API_PATH}/godown_wise`)) as {
    data?: unknown[]
  }
  return (envelope?.data ?? []).map((item) => {
    const row = (item ?? {}) as Record<string, unknown>

    return {
      godownId: Number(row.godownId ?? 0),
      godownName: String(row.godownName ?? 'Unknown godown'),
      godownCode: String(row.godownCode ?? ''),
      totalEntries: num(row.totalEntries),
      totalInwardQuantity: num(row.totalInwardQuantity),
      totalOutwardQuantity: num(row.totalOutwardQuantity),
      totalClosingQuantity: num(row.totalClosingQuantity),
      totalAmount: num(row.totalAmount),
    }
  })
}

export async function fetchTransporterWiseDashboard(): Promise<
  TransporterWiseDatum[]
> {
  const envelope = (await getData(`${API_PATH}/transporter_wise`)) as {
    data?: unknown[]
  }
  return (envelope?.data ?? []).map((item) => {
    const row = (item ?? {}) as Record<string, unknown>

    return {
      transporterName: String(row.transporterName ?? 'Unknown'),
      vehicleNumber: row.vehicleNumber ? String(row.vehicleNumber) : null,
      totalVouchers: num(row.totalVouchers),
      totalQuantity: num(row.totalQuantity),
      totalAmount: num(row.totalAmount),
    }
  })
}

export async function fetchUserWiseDashboard(): Promise<UserWiseDatum[]> {
  const envelope = (await getData(`${API_PATH}/user_wise`)) as {
    data?: unknown[]
  }
  return (envelope?.data ?? []).map((item) => {
    const row = (item ?? {}) as Record<string, unknown>

    return {
      userId: row.user_id
        ? Number(row.user_id)
        : row.userId
          ? Number(row.userId)
          : null,
      userName: String(row.user_name ?? row.userName ?? 'Unknown user'),
      totalVouchers: num(row.total_vouchers ?? row.totalVouchers),
      delivery_notes: num(row.delivery_notes),
      receipt_notes: num(row.receipt_notes),
      freights: num(row.freights),
      total_amount: num(row.total_amount),
    }
  })
}
