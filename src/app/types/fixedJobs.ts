import { FixedJobs, User, WorkSchedule, Stores } from '@prisma/client'

export interface StoreData extends Stores {
  fixedJobs: FixedJobs[] & {
    mashguiach: User
  }[]
}

export interface Mashguiach extends User {}

export interface WorkScheduleData extends WorkSchedule {
  day: string
  timeIn: string | null
  timeOut: string | null
  isDayOff: boolean
}
