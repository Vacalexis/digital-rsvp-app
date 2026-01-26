import { Injectable, signal, computed } from '@angular/core';
import { Guest, RsvpStatus, GuestStats } from '@models/index';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  private readonly STORAGE_KEY = 'digital_rsvp_guests';
  
  private guestsSignal = signal<Guest[]>([]);
  
  public guests = computed(() => this.guestsSignal());
  
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const guests = JSON.parse(stored) as Guest[];
        this.guestsSignal.set(guests);
      }
    } catch (error) {
      console.error('Error loading guests from storage:', error);
      this.guestsSignal.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.guestsSignal()));
    } catch (error) {
      console.error('Error saving guests to storage:', error);
    }
  }

  private generateId(): string {
    return `gst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getGuestsByEventId(eventId: string): Guest[] {
    return this.guestsSignal().filter((g) => g.eventId === eventId);
  }

  getGuestById(id: string): Guest | undefined {
    return this.guestsSignal().find((g) => g.id === id);
  }

  createGuest(guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Guest {
    const now = new Date().toISOString();
    const newGuest: Guest = {
      ...guestData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.guestsSignal.update((guests) => [...guests, newGuest]);
    this.saveToStorage();
    return newGuest;
  }

  updateGuest(id: string, updates: Partial<Guest>): Guest | undefined {
    let updatedGuest: Guest | undefined;

    this.guestsSignal.update((guests) =>
      guests.map((guest) => {
        if (guest.id === id) {
          updatedGuest = {
            ...guest,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedGuest;
        }
        return guest;
      })
    );

    if (updatedGuest) {
      this.saveToStorage();
    }

    return updatedGuest;
  }

  deleteGuest(id: string): boolean {
    const initialLength = this.guestsSignal().length;
    
    this.guestsSignal.update((guests) => guests.filter((g) => g.id !== id));
    
    if (this.guestsSignal().length < initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  deleteGuestsByEventId(eventId: string): number {
    const initialLength = this.guestsSignal().length;
    
    this.guestsSignal.update((guests) => guests.filter((g) => g.eventId !== eventId));
    
    const deletedCount = initialLength - this.guestsSignal().length;
    if (deletedCount > 0) {
      this.saveToStorage();
    }
    
    return deletedCount;
  }

  updateRsvpStatus(id: string, status: RsvpStatus): Guest | undefined {
    return this.updateGuest(id, {
      rsvpStatus: status,
      rsvpDate: new Date().toISOString(),
    });
  }

  getGuestStats(eventId: string): GuestStats {
    const guests = this.getGuestsByEventId(eventId);
    
    const stats: GuestStats = {
      total: guests.length,
      confirmed: 0,
      declined: 0,
      pending: 0,
      maybe: 0,
      withPlusOne: 0,
      totalAttending: 0,
      dietaryRestrictions: 0,
    };

    guests.forEach((guest) => {
      switch (guest.rsvpStatus) {
        case 'confirmed':
          stats.confirmed++;
          stats.totalAttending++;
          if (guest.plusOne && guest.plusOneConfirmed) {
            stats.withPlusOne++;
            stats.totalAttending++;
          }
          break;
        case 'declined':
          stats.declined++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'maybe':
          stats.maybe++;
          break;
      }

      if (guest.dietaryRestrictions || guest.allergies) {
        stats.dietaryRestrictions++;
      }
    });

    return stats;
  }

  getGuestsByStatus(eventId: string, status: RsvpStatus): Guest[] {
    return this.getGuestsByEventId(eventId).filter((g) => g.rsvpStatus === status);
  }

  getGuestsByGroup(eventId: string): Map<string, Guest[]> {
    const guests = this.getGuestsByEventId(eventId);
    const groups = new Map<string, Guest[]>();

    guests.forEach((guest) => {
      const groupName = guest.group || 'Sem grupo';
      const groupGuests = groups.get(groupName) || [];
      groupGuests.push(guest);
      groups.set(groupName, groupGuests);
    });

    return groups;
  }

  exportToCSV(eventId: string): string {
    const guests = this.getGuestsByEventId(eventId);
    
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Status RSVP',
      'Data RSVP',
      'Plus One',
      'Nome Plus One',
      'Restrições Alimentares',
      'Alergias',
      'Pedido de Música',
      'Grupo',
      'Mesa',
      'Notas',
    ];

    const rows = guests.map((guest) => [
      guest.name,
      guest.email || '',
      guest.phone || '',
      guest.rsvpStatus,
      guest.rsvpDate || '',
      guest.plusOne ? 'Sim' : 'Não',
      guest.plusOneName || '',
      guest.dietaryRestrictions || '',
      guest.allergies || '',
      guest.songRequest || '',
      guest.group || '',
      guest.tableNumber?.toString() || '',
      guest.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  markInvitationSent(id: string): Guest | undefined {
    return this.updateGuest(id, {
      invitationSent: true,
      invitationSentDate: new Date().toISOString(),
    });
  }

  markReminderSent(id: string): Guest | undefined {
    return this.updateGuest(id, {
      reminderSent: true,
      reminderSentDate: new Date().toISOString(),
    });
  }
}
