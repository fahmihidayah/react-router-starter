export type MonthlyReportItem = {
  id: string
  name: string
  recordCount: number
  activeDays: number
  durationMinutes: number
  value?: number
  unit?: string
  archived?: boolean
}

export type MonthlyLearnerReport = {
  month: string
  minimumMonth: string
  maximumMonth: string
  eligibleDays: number
  activeDays: number
  trackingPercentage: number
  totalRecords: number
  goalItems: MonthlyReportItem[]
  trackItems: MonthlyReportItem[]
}
