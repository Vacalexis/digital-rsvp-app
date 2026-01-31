import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  peopleOutline,
  homeOutline,
  arrowForwardOutline,
  heartOutline, checkmarkCircle } from 'ionicons/icons';

import { InvitationCardComponent } from '@components/invitation-card/invitation-card.component';
import { InvitationType, InvitationTheme, Event, Invitation, InvitedPerson, InvitedChild } from '@models/index';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    InvitationCardComponent,
  ],
  templateUrl: './preview.page.html',
  styleUrls: ['./preview.page.scss'],
})
export class PreviewPage implements OnInit {
  theme = signal<InvitationTheme>('elegant');
  invitationType = signal<InvitationType>('single');

  // Sample event data for preview
  sampleEvent: Event = {
    id: 'preview',
    title: 'O Nosso Casamento',
    subtitle: 'Celebrem connosco o nosso dia especial',
    description: 'Junte-se a nós para celebrar o amor e o início de uma nova jornada.',
    eventType: 'wedding',
    date: '2026-07-15',
    time: '15:00',
    venue: {
      name: 'Quinta do Vale',
      address: 'Rua das Flores, 123',
      city: 'Lisboa',
      country: 'Portugal',
    },
    hosts: ['Ana Silva', 'João Santos'],
    theme: 'elegant',
    language: 'pt',
    allowPlusOne: true,
    askDietaryRestrictions: true,
    askSongRequest: true,
    askChildrenInfo: true,
    shareCode: 'preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Sample invitation computed based on type
  sampleInvitation = computed<Invitation>(() => {
    const type = this.invitationType();
    const theme = this.theme();

    const primaryGuest: InvitedPerson = {
      name: type === 'single' ? 'Maria Silva' : 'Ana Costa',
      email: 'maria@example.com',
    };

    let secondaryGuest: InvitedPerson | undefined;
    let children: InvitedChild[] | undefined;

    if (type === 'couple') {
      secondaryGuest = {
        name: 'João Costa',
      };
    } else if (type === 'family') {
      secondaryGuest = {
        name: 'Pedro Silva',
      };
      children = [
        { name: 'Sofia Silva', age: 8 },
        { name: 'Miguel Silva', age: 5 },
      ];
    }

    return {
      id: 'preview-invitation',
      eventId: 'preview',
      invitationType: type,
      shareCode: 'preview-code',
      primaryGuest,
      secondaryGuest,
      allowPlusOne: type === 'single',
      children,
      rsvpSubmitted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Update event theme when theme changes
  eventWithTheme = computed<Event>(() => ({
    ...this.sampleEvent,
    theme: this.theme(),
  }));

  // Current type data (for template)
  currentType = computed(() => {
    const type = this.invitationType();
    return this.types.find(t => t.value === type) || this.types[0];
  });

  // Invitation types data
  types = [
    {
      value: 'single' as InvitationType,
      icon: 'person-outline',
      label: 'Individual',
      description: 'Para um convidado',
    },
    {
      value: 'couple' as InvitationType,
      icon: 'people-outline',
      label: 'Casal',
      description: 'Para dois convidados',
    },
    {
      value: 'family' as InvitationType,
      icon: 'home-outline',
      label: 'Família',
      description: 'Para casal com filhos',
    },
  ];

  // Theme names for display
  themeNames: Record<InvitationTheme, string> = {
    elegant: 'Elegante',
    minimal: 'Minimalista',
    floral: 'Floral',
    rustic: 'Rústico',
    modern: 'Moderno',
    romantic: 'Romântico',
    tropical: 'Tropical',
    classic: 'Clássico',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({heartOutline,checkmarkCircle,arrowForwardOutline,personOutline,peopleOutline,homeOutline,});
  }

  ngOnInit() {
    // Get theme from URL parameter
    const themeParam = this.route.snapshot.paramMap.get('theme');
    if (themeParam && this.isValidTheme(themeParam)) {
      this.theme.set(themeParam as InvitationTheme);
      this.sampleEvent.theme = themeParam as InvitationTheme;
    }
  }

  isValidTheme(theme: string): boolean {
    const validThemes: InvitationTheme[] = [
      'elegant',
      'minimal',
      'floral',
      'rustic',
      'modern',
      'romantic',
      'tropical',
      'classic',
    ];
    return validThemes.includes(theme as InvitationTheme);
  }

  onTypeChange(event: any) {
    this.invitationType.set(event.detail.value);
  }

  startCustomization() {
    // Navigate to customization flow with selected theme
    this.router.navigate(['/customize'], {
      queryParams: { theme: this.theme() },
    });
  }

  goBack() {
    this.router.navigate(['/themes']);
  }
}
