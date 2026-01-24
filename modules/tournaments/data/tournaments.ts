export interface Tournament {
  id: string;
  name: string;
  startDate: string; // ISO Format YYYY-MM-DD
  endDate: string;   // ISO Format YYYY-MM-DD
  format: 'BP' | 'WSDC' | 'Académico' | 'Otro';
  location: string;
  isOnline: boolean;
  organizer: string;
  contact: string;
}

// Helper to simulate upcoming dates based on current date
const today = new Date();
const addDays = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const UPCOMING_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'Torneo Abierto de Verano',
    startDate: addDays(5),
    endDate: addDays(7),
    format: 'BP',
    location: 'Madrid, España',
    isOnline: false,
    organizer: 'Sociedad de Debate UCM',
    contact: 'debate@ucm.es'
  },
  {
    id: '2',
    name: 'Copa Latinoamericana Online',
    startDate: addDays(12),
    endDate: addDays(14),
    format: 'BP',
    location: 'Online (Discord)',
    isOnline: true,
    organizer: 'Red Latinoamericana',
    contact: 'contacto@debate-latam.org'
  },
  {
    id: '3',
    name: 'Nacional Escolar WSDC',
    startDate: addDays(25),
    endDate: addDays(27),
    format: 'WSDC',
    location: 'Bogotá, Colombia',
    isOnline: false,
    organizer: 'Asociación Nacional',
    contact: 'wsdc@colombia.co'
  },
  {
    id: '4',
    name: 'Open de Novatos Austral',
    startDate: addDays(35),
    endDate: addDays(36),
    format: 'BP',
    location: 'Santiago, Chile',
    isOnline: false,
    organizer: 'Sociedad Austral',
    contact: 'novatos@austral.cl'
  },
  {
    id: '5',
    name: 'Liga de Invierno',
    startDate: addDays(40),
    endDate: addDays(42),
    format: 'BP',
    location: 'Online (Zoom)',
    isOnline: true,
    organizer: 'Debate Online League',
    contact: 'info@onlineleague.com'
  }
];