import { Tournament } from '../data/tournaments';

export const createGoogleCalendarUrl = (tournament: Partial<Tournament>) => {
  if (!tournament.startDate || !tournament.endDate || !tournament.name) return '';

  const formatDate = (dateStr: string) => dateStr.replace(/-/g, ''); // YYYYMMDD
  
  // Google Calendar format requires YYYYMMDD
  const start = formatDate(tournament.startDate);
  
  // For all-day events, Google expects the end date to be the day AFTER the event ends.
  // We will simply pass the provided end date; users can adjust manually in the UI if needed.
  const end = formatDate(tournament.endDate); 

  const details = `Formato: ${tournament.format || 'N/A'}\nOrganiza: ${tournament.organizer || 'N/A'}\nContacto: ${tournament.contact || 'N/A'}`;
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', tournament.name);
  url.searchParams.append('dates', `${start}/${end}`);
  url.searchParams.append('details', details);
  url.searchParams.append('location', tournament.location || '');
  
  return url.toString();
};