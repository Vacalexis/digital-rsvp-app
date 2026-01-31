import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  rocketOutline,
  checkmarkCircleOutline,
  sparklesOutline,
  peopleOutline,
  statsChartOutline,
  heartOutline,
  arrowForwardOutline,
  colorPaletteOutline,
  timeOutline,
  cashOutline,
} from 'ionicons/icons';

import { INVITATION_THEMES } from '@models/index';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
  ],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  themes = INVITATION_THEMES;
  selectedThemeIndex = signal(0);
  currentYear = new Date().getFullYear();

  features = [
    {
      icon: 'rocket-outline',
      title: 'Entrega Instantânea',
      description: 'Recebe o teu convite digital em minutos, não em dias',
    },
    {
      icon: 'color-palette-outline',
      title: 'Personalização Total',
      description: 'Escolhe o tema, personaliza os detalhes, vê o resultado final',
    },
    {
      icon: 'people-outline',
      title: 'Gestão de Convidados',
      description: 'BackOffice completo para gerir a lista e as confirmações',
    },
    {
      icon: 'stats-chart-outline',
      title: 'Estatísticas em Tempo Real',
      description: 'Acompanha as confirmações, restrições alimentares e +1',
    },
  ];

  steps = [
    {
      number: '1',
      title: 'Escolhe o Tema',
      description: 'Navega pela nossa galeria de temas elegantes',
    },
    {
      number: '2',
      title: 'Personaliza',
      description: 'Adiciona os teus detalhes: nomes, data, local',
    },
    {
      number: '3',
      title: 'Adquire',
      description: 'Pagamento seguro, acesso imediato',
    },
    {
      number: '4',
      title: 'Envia e Gere',
      description: 'Partilha com convidados e acompanha RSVPs',
    },
  ];

  constructor(private router: Router) {
    addIcons({
      rocketOutline,
      checkmarkCircleOutline,
      sparklesOutline,
      peopleOutline,
      statsChartOutline,
      heartOutline,
      arrowForwardOutline,
      colorPaletteOutline,
      timeOutline,
      cashOutline,
    });
  }

  navigateToThemes() {
    this.router.navigate(['/themes']);
  }

  navigateToPreview(themeValue: string) {
    this.router.navigate(['/preview', themeValue]);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
