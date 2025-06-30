export interface AdoptionSchedule {
  petId: string;
  locationDetails: string;
  scheduledDateTime: string; // ISO string format like "2021-09-01T00:00:00.000Z"
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Enum-style status
  amount: number;
}
