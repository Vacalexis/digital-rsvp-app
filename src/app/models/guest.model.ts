/**
 * Guest Model - Representa um convidado
 */
export interface Guest {
  id: string;
  eventId: string;
  invitationId?: string; // Link ao convite específico
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RsvpStatus;
  rsvpDate?: string;
  plusOne: boolean;
  plusOneName?: string;
  plusOneConfirmed?: boolean;
  plusOneDietaryRestrictions?: string;
  dietaryRestrictions?: string;
  allergies?: string;
  songRequest?: string;
  // Filhos
  childrenAttending?: number;
  childrenDietaryRestrictions?: string;
  customAnswers?: Record<string, string | string[]>;
  notes?: string;
  tableNumber?: number;
  group?: string;
  invitationSent: boolean;
  invitationSentDate?: string;
  reminderSent: boolean;
  reminderSentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type RsvpStatus = "pending" | "confirmed" | "declined" | "maybe";

export const RSVP_STATUS_CONFIG: Record<
  RsvpStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Pendente", color: "warning", icon: "time-outline" },
  confirmed: {
    label: "Confirmado",
    color: "success",
    icon: "checkmark-circle-outline",
  },
  declined: {
    label: "Recusado",
    color: "danger",
    icon: "close-circle-outline",
  },
  maybe: { label: "Talvez", color: "medium", icon: "help-circle-outline" },
};

export interface GuestGroup {
  name: string;
  guests: Guest[];
}

export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  withPlusOne: number;
  totalAttending: number;
  dietaryRestrictions: number;
}
