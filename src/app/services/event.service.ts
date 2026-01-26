import { Injectable, signal, computed } from '@angular/core';
import { Event, EventType, InvitationTheme } from '@models/index';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly STORAGE_KEY = 'digital_rsvp_events';
  
  private eventsSignal = signal<Event[]>([]);
  
  public events = computed(() => this.eventsSignal());
  
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const events = JSON.parse(stored) as Event[];
        this.eventsSignal.set(events);
      }
    } catch (error) {
      console.error('Error loading events from storage:', error);
      this.eventsSignal.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.eventsSignal()));
    } catch (error) {
      console.error('Error saving events to storage:', error);
    }
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateShareCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getEventById(id: string): Event | undefined {
    return this.eventsSignal().find((e) => e.id === id);
  }

  getEventByShareCode(code: string): Event | undefined {
    return this.eventsSignal().find((e) => e.shareCode === code);
  }

  createEvent(eventData: Omit<Event, 'id' | 'shareCode' | 'createdAt' | 'updatedAt'>): Event {
    const now = new Date().toISOString();
    const newEvent: Event = {
      ...eventData,
      id: this.generateId(),
      shareCode: this.generateShareCode(),
      createdAt: now,
      updatedAt: now,
    };

    this.eventsSignal.update((events) => [...events, newEvent]);
    this.saveToStorage();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    let updatedEvent: Event | undefined;

    this.eventsSignal.update((events) =>
      events.map((event) => {
        if (event.id === id) {
          updatedEvent = {
            ...event,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedEvent;
        }
        return event;
      })
    );

    if (updatedEvent) {
      this.saveToStorage();
    }

    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    const initialLength = this.eventsSignal().length;
    
    this.eventsSignal.update((events) => events.filter((e) => e.id !== id));
    
    if (this.eventsSignal().length < initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  duplicateEvent(id: string): Event | undefined {
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
