import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event, EventType, InvitationTheme } from '@models/index';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  private eventsSignal = signal<Event[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  public events = computed(() => this.eventsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());
  
  constructor() {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const events = await firstValueFrom(
        this.http.get<Event[]>(`${this.API_URL}/events`)
      );
      this.eventsSignal.set(events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      this.errorSignal.set('Erro ao carregar eventos');
      this.eventsSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getEventById(id: string): Event | undefined {
    return this.eventsSignal().find((e) => e.id === id);
  }

  async getEventByIdAsync(id: string): Promise<Event | undefined> {
    try {
      const event = await firstValueFrom(
        this.http.get<Event>(`${this.API_URL}/events/${id}`)
      );
      return event;
    } catch (error) {
      console.error('Error fetching event:', error);
      return undefined;
    }
  }

  getEventByShareCode(code: string): Event | undefined {
    return this.eventsSignal().find((e) => e.shareCode === code.toUpperCase());
  }

  async getEventByShareCodeAsync(code: string): Promise<Event | undefined> {
    try {
      const event = await firstValueFrom(
        this.http.get<Event>(`${this.API_URL}/events/share/${code}`)
      );
      return event;
    } catch (error) {
      console.error('Error fetching event by share code:', error);
      return undefined;
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'shareCode' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    try {
      const newEvent = await firstValueFrom(
        this.http.post<Event>(`${this.API_URL}/events`, eventData)
      );
      
      // Update local state
      this.eventsSignal.update((events) => [...events, newEvent]);
      
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    try {
      const updatedEvent = await firstValueFrom(
        this.http.put<Event>(`${this.API_URL}/events/${id}`, updates)
      );
      
      // Update local state
      this.eventsSignal.update((events) =>
        events.map((event) => (event.id === id ? updatedEvent : event))
      );
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      return undefined;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/events/${id}`)
      );
      
      // Update local state
      this.eventsSignal.update((events) => events.filter((e) => e.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  async duplicateEvent(id: string): Promise<Event | undefined> {
    const event = this.getEventById(id);
    if (!event) return undefined;

    const { id: _, shareCode: __, createdAt: ___, updatedAt: ____, ...eventData } = event;
    
    return this.createEvent({
      ...eventData,
      title: `${event.title} (Cópia)`,
    });
  }

  getEventsByType(type: EventType): Event[] {
    return this.eventsSignal().filter((e) => e.eventType === type);
  }

  getUpcomingEvents(): Event[] {
    const now = new Date().toISOString();
    return this.eventsSignal()
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getPastEvents(): Event[] {
    const now = new Date().toISOString();
    return this.eventsSignal()
      .filter((e) => e.date < now)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}
