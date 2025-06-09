import { addDays } from 'date-fns';

export const startOfISOWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  export const endOfISOWeek = (date) => {
    const start = startOfISOWeek(date);
    return addDays(start, 6);
  };