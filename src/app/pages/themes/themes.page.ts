import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  heartOutline,
  leafOutline,
  roseOutline,
  flowerOutline,
  diamondOutline,
  sunnyOutline,
  ribbonOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { InvitationTheme } from '../../models';

interface ThemeData {
  id: InvitationTheme;
  name: string;
  description: string;
  color: string;
  crestIcon: string;
  category: 'classic' | 'modern' | 'nature';
  tags: string[];
}

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonChip,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
  ],
  templateUrl: './themes.page.html',
  styleUrls: ['./themes.page.scss'],
})
export class ThemesPage {
  searchTerm = signal('');
  selectedCategory = signal<'all' | 'classic' | 'modern' | 'nature'>('all');

  themes: ThemeData[] = [
    {
      id: 'elegant',
      name: 'Elegante',
      description: 'Sofisticação clássica com ornamentos dourados',
      color: '#8b5a5a',
      crestIcon: '★',
      category: 'classic',
      tags: ['sofisticado', 'formal', 'dourado', 'clássico'],
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      description: 'Design limpo e contemporâneo',
      color: '#5a5a5a',
      crestIcon: '◇',
      category: 'modern',
      tags: ['simples', 'moderno', 'limpo', 'contemporâneo'],
    },
    {
      id: 'floral',
      name: 'Floral',
      description: 'Flores delicadas e natureza',
      color: '#7d9a7d',
      crestIcon: '✿',
      category: 'nature',
      tags: ['flores', 'natural', 'jardim', 'primavera'],
    },
    {
      id: 'rustic',
      name: 'Rústico',
      description: 'Charme campestre e acolhedor',
      color: '#8b7355',
      crestIcon: '❧',
      category: 'nature',
      tags: ['campo', 'vintage', 'natural', 'madeira'],
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Geométrico e inovador',
      color: '#4a5a6a',
      crestIcon: '◇',
      category: 'modern',
      tags: ['geométrico', 'ousado', 'atual', 'design'],
    },
    {
      id: 'romantic',
      name: 'Romântico',
      description: 'Suave e delicado',
      color: '#c9a5a5',
      crestIcon: '♥',
      category: 'classic',
      tags: ['suave', 'delicado', 'amor', 'corações'],
    },
    {
      id: 'tropical',
      name: 'Tropical',
      description: 'Vibrante e festivo',
      color: '#e8a547',
      crestIcon: '☀',
      category: 'nature',
      tags: ['praia', 'verão', 'sol', 'colorido'],
    },
    {
      id: 'classic',
      name: 'Clássico',
      description: 'Tradicional e atemporal',
      color: '#6b5a4d',
      crestIcon: '♛',
      category: 'classic',
      tags: ['tradicional', 'formal', 'intemporal', 'realeza'],
    },
  ];

  filteredThemes = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.themes.filter((theme) => {
      const matchesSearch =
        !search ||
        theme.name.toLowerCase().includes(search) ||
        theme.description.toLowerCase().includes(search) ||
        theme.tags.some((tag) => tag.toLowerCase().includes(search));

      const matchesCategory =
        category === 'all' || theme.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  constructor(private router: Router) {
    addIcons({
      searchOutline,
      heartOutline,
      leafOutline,
      roseOutline,
      flowerOutline,
      diamondOutline,
      sunnyOutline,
      ribbonOutline,
      sparklesOutline,
    });
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }

  selectCategory(category: 'all' | 'classic' | 'modern' | 'nature') {
    this.selectedCategory.set(category);
  }

  navigateToPreview(themeId: InvitationTheme) {
    this.router.navigate(['/preview', themeId]);
  }

  getCategoryLabel(category: 'classic' | 'modern' | 'nature'): string {
    const labels = {
      classic: 'Clássico',
      modern: 'Moderno',
      nature: 'Natureza',
    };
    return labels[category];
  }

  getCategoryIcon(category: 'classic' | 'modern' | 'nature'): string {
    const icons = {
      classic: 'ribbon-outline',
      modern: 'diamond-outline',
      nature: 'leaf-outline',
    };
    return icons[category];
  }
}
