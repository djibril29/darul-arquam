export function formatRelativeDate(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Il y a 1 semaine";
  if (diffWeeks < 5) return `Il y a ${diffWeeks} semaines`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths <= 1 ? "Il y a 1 mois" : `Il y a ${diffMonths} mois`;
}
