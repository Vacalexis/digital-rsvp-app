import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Guest, RsvpStatus, GuestStats } from '@models/index';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  private guestsSignal = signal<Guest[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  public guests = computed(() => this.guestsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());
  
  constructor() {
    this.loadGuests();
  }

  async loadGuests(eventId?: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const url = eventId 
        ? `${this.API_URL}/guests?eventId=${eventId}`
        : `${this.API_URL}/guests`;
      
      const guests = await firstValueFrom(
        this.http.get<Guest[]>(url)
      );
      this.guestsSignal.set(guests || []);
    } catch (error) {
      console.error('Error loading guests:', error);
      this.errorSignal.set('Erro ao carregar convidados');
      this.guestsSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getGuestsByEventId(eventId: string): Guest[] {
    return this.guestsSignal().filter((g) => g.eventId === eventId);
  }

  async getGuestsByEventIdAsync(eventId: string): Promise<Guest[]> {
    try {
      const guests = await firstValueFrom(
        this.http.get<Guest[]>(`${this.API_URL}/guests?eventId=${eventId}`)
      );
      return guests || [];
    } catch (error) {
      console.error('Error fetching guests:', error);
      return [];
    }
  }

  getGuestById(id: string): Guest | undefined {
    return this.guestsSignal().find((g) => g.id === id);
  }

  async createGuest(guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guest> {
    try {
      const newGuest = await firstValueFrom(
        this.http.post<Guest>(`${this.API_URL}/guests`, guestData)
      );
      
      // Update local state
      this.guestsSignal.update((guests) => [...guests, newGuest]);
      
      return newGuest;
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | undefined> {
    try {
      const updatedGuest = await firstValueFrom(
        this.http.put<Guest>(`${this.API_URL}/guests/${id}`, updates)
      );
      
      // Update local state
      this.guestsSignal.update((guests) =>
        guests.map((guest) => (guest.id === id ? updatedGuest : guest))
      );
      
      return updatedGuest;
    } catch (error) {
      console.error('Error updating guest:', error);
      return undefined;
    }
  }

  async deleteGuest(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/guests/${id}`)
      );
      
      // Update local state
      this.guestsSignal.update((guests) => guests.filter((g) => g.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      return false;
    }
  }

  async deleteGuestsByEventId(eventId: string): Promise<number> {
    const guests = this.getGuestsByEventId(eventId);
    let deletedCount = 0;
    
    for (const guest of guests) {
      const deleted = await this.deleteGuest(guest.id);
      if (deleted) deletedCount++;
    }
    
    return deletedCount;
  }

  async updateRsvpStatus(id: string, status: RsvpStatus): Promise<Guest | undefined> {
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

  async markInvitationSent(id: string): Promise<Guest | undefined> {
    return this.updateGuest(id, {
      invitationSent: true,
      invitationSentDate: new Date().toISOString(),
    });
  }

  async markReminderSent(id: string): Promise<Guest | undefined> {
    return this.updateGuest(id, {
      reminderSent: true,
      reminderSentDate: new Date().toISOString(),
    });
  }
}
