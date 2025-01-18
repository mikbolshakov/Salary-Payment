export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate());
  return date.toISOString().slice(0, 10);
};
