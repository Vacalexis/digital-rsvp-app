/**
 * Event Model - Representa um evento/convite
 */
export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  eventType: EventType;
  date: string; // ISO date string
  time?: string;
  endDate?: string;
  endTime?: string;
  venue: Venue;
  hosts: string[];
  coverImage?: string;
  theme: InvitationTheme;
  language: string;
  schedule?: ScheduleItem[];
  rsvpDeadline?: string;
  maxGuests?: number;
  allowPlusOne: boolean;
  askDietaryRestrictions: boolean;
  askSongRequest: boolean;
  askChildrenInfo: boolean;
  customQuestions?: CustomQuestion[];
  shareCode: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invitation - Um convite individual enviado a pessoa(s) específica(s)
 * Cada convite tem o seu próprio código e dados pré-preenchidos
 */
export interface Invitation {
  id: string;
  eventId: string;
  invitationType: InvitationType;
  shareCode: string; // Código único para este convite

  // Dados pré-preenchidos pelo host
  primaryGuest: InvitedPerson;
  secondaryGuest?: InvitedPerson; // Para casais
  allowPlusOne: boolean; // Sobrepõe o default do evento
  childrenCount?: number; // Número de filhos incluídos
  childrenNames?: string[]; // Nomes dos filhos (legacy, deprecated)
  children?: InvitedChild[]; // Dados completos dos filhos

  // Estado
  rsvpSubmitted: boolean;
  rsvpDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface InvitedPerson {
  name: string;
  email?: string;
  phone?: string;
}

export interface InvitedChild {
  name: string;
  age?: number; // Idade opcional - se não preenchida, convidado indica no RSVP
}

export type InvitationType =
  | "single" // Pessoa individual
  | "single-plus-one" // Pessoa + acompanhante
  | "couple" // Casal
  | "family" // Pessoa/Casal + filhos
  | "group"; // Grupo personalizado

export const INVITATION_TYPES: {
  value: InvitationType;
  label: string;
  description: string;
}[] = [
  { value: "single", label: "Individual", description: "Uma pessoa" },
  {
    value: "single-plus-one",
    label: "Individual + Acompanhante",
    description: "Uma pessoa que pode trazer acompanhante",
  },
  {
    value: "couple",
    label: "Casal",
    description: "Duas pessoas (nomes pré-definidos)",
  },
  { value: "family", label: "Família", description: "Inclui filhos" },
  { value: "group", label: "Grupo", description: "Grupo personalizado" },
];

export type EventType =
  | "wedding"
  | "engagement"
  | "birthday"
  | "baby-shower"
  | "anniversary"
  | "graduation"
  | "corporate"
  | "other";

export interface Venue {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapsUrl?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface CustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  options?: string[];
  required: boolean;
}

export type InvitationTheme =
  | "elegant"
  | "minimal"
  | "floral"
  | "rustic"
  | "modern"
  | "romantic"
  | "tropical"
  | "classic";

export const EVENT_TYPES: { value: EventType; label: string; icon: string }[] =
  [
    { value: "wedding", label: "Casamento", icon: "heart" },
    { value: "engagement", label: "Noivado", icon: "diamond" },
    { value: "birthday", label: "Aniversário", icon: "gift" },
    { value: "baby-shower", label: "Chá de Bebé", icon: "balloon" },
    {
      value: "anniversary",
      label: "Aniversário de Casamento",
      icon: "sparkles",
    },
    { value: "graduation", label: "Formatura", icon: "school" },
    { value: "corporate", label: "Evento Corporativo", icon: "briefcase" },
    { value: "other", label: "Outro", icon: "calendar" },
  ];

export const INVITATION_THEMES: {
  value: InvitationTheme;
  label: string;
  color: string;
}[] = [
  { value: "elegant", label: "Elegante", color: "#8b5a5a" },
  { value: "minimal", label: "Minimalista", color: "#2d2d2d" },
  { value: "floral", label: "Floral", color: "#7d9a7d" },
  { value: "rustic", label: "Rústico", color: "#a67c52" },
  { value: "modern", label: "Moderno", color: "#4a5568" },
  { value: "romantic", label: "Romântico", color: "#c9a0a0" },
  { value: "tropical", label: "Tropical", color: "#38a169" },
  { value: "classic", label: "Clássico", color: "#c9a962" },
];
