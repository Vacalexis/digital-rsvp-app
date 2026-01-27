import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { Invitation, InvitationType, Event } from "@models/index";

export interface RsvpLookupResult {
  type: "invitation" | "event";
  invitation: Invitation | null;
  event: Event | null;
}

export type CreateInvitationData = Omit<
  Invitation,
  "id" | "shareCode" | "rsvpSubmitted" | "rsvpDate" | "createdAt" | "updatedAt"
>;

@Injectable({
  providedIn: "root",
})
export class InvitationService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private invitationsSignal = signal<Invitation[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  public invitations = computed(() => this.invitationsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  /**
   * Load invitations for a specific event
   */
  async loadInvitationsByEvent(eventId: string): Promise<Invitation[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const invitations = await firstValueFrom(
        this.http.get<Invitation[]>(
          `${this.API_URL}/invitations?eventId=${eventId}`,
        ),
      );
      this.invitationsSignal.set(invitations);
      return invitations;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load invitations";
      this.errorSignal.set(message);
      console.error("Error loading invitations:", error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Get an invitation by ID
   */
  async getInvitation(id: string): Promise<Invitation | null> {
    try {
      return await firstValueFrom(
        this.http.get<Invitation>(`${this.API_URL}/invitations/${id}`),
      );
    } catch (error) {
      console.error("Error fetching invitation:", error);
      return null;
    }
  }

  /**
   * Look up RSVP by code - can return either an Invitation or legacy Event
   * This is the main entry point for the /rsvp/:code route
   */
  async lookupByCode(code: string): Promise<RsvpLookupResult | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<RsvpLookupResult>(
          `${this.API_URL}/invitations/code/${code}`,
        ),
      );
      return result;
    } catch (error) {
      console.error("Error looking up RSVP code:", error);
      return null;
    }
  }

  /**
   * Create a new invitation for an event
   */
  async createInvitation(
    data: CreateInvitationData,
  ): Promise<Invitation | null> {
    try {
      const invitation = await firstValueFrom(
        this.http.post<Invitation>(`${this.API_URL}/invitations`, data),
      );

      // Update local state
      this.invitationsSignal.update((list) => [...list, invitation]);

      return invitation;
    } catch (error) {
      console.error("Error creating invitation:", error);
      return null;
    }
  }

  /**
   * Update an invitation (e.g., mark as RSVP submitted)
   */
  async updateInvitation(
    id: string,
    updates: Partial<Invitation>,
  ): Promise<Invitation | null> {
    try {
      const updated = await firstValueFrom(
        this.http.put<Invitation>(`${this.API_URL}/invitations/${id}`, updates),
      );

      // Update local state
      this.invitationsSignal.update((list) =>
        list.map((inv) => (inv.id === id ? updated : inv)),
      );

      return updated;
    } catch (error) {
      console.error("Error updating invitation:", error);
      return null;
    }
  }

  /**
   * Delete an invitation
   */
  async deleteInvitation(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/invitations/${id}`),
      );

      // Update local state
      this.invitationsSignal.update((list) =>
        list.filter((inv) => inv.id !== id),
      );

      return true;
    } catch (error) {
      console.error("Error deleting invitation:", error);
      return false;
    }
  }

  /**
   * Submit RSVP for an invitation
   */
  async submitRsvp(invitationId: string): Promise<boolean> {
    return !!(await this.updateInvitation(invitationId, {
      rsvpSubmitted: true,
      rsvpDate: new Date().toISOString(),
    }));
  }

  /**
   * Get pending invitations (not yet RSVP'd) for an event
   */
  getPendingInvitations(eventId: string): Invitation[] {
    return this.invitationsSignal().filter(
      (inv) => inv.eventId === eventId && !inv.rsvpSubmitted,
    );
  }

  /**
   * Get submitted invitations for an event
   */
  getSubmittedInvitations(eventId: string): Invitation[] {
    return this.invitationsSignal().filter(
      (inv) => inv.eventId === eventId && inv.rsvpSubmitted,
    );
  }

  /**
   * Clear current invitations (when switching events)
   */
  clearInvitations(): void {
    this.invitationsSignal.set([]);
  }
}
