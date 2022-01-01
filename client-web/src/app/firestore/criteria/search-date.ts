import sub from 'date-fns/sub';
import add from 'date-fns/add';
import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import isBefore from 'date-fns/isBefore';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';

import { SearchCriteria } from './search-criteria';

export class SearchDate {
  private date!: Date;
  private range!: Date[];

  // Today
  startOfToday() {
    this.date = startOfToday();
    return this.toDate();
  }

  endOfToday() {
    this.date = endOfToday();
    return this.toDate();
  }

  todayQuery(column: string, searchCriteria?: SearchCriteria) {
    searchCriteria = searchCriteria || new SearchCriteria();
    searchCriteria.greaterEqThan(column, this.startOfToday());
    searchCriteria.lessThan(column, this.endOfToday());
    
    return searchCriteria;
  }

  today() {
    this.range = [
      this.startOfToday(),
      this.endOfToday(),
    ];
  }

  // This Week
  startOfWeek() {
    this.date = startOfWeek(new Date(), { weekStartsOn: 1 });
    return this.toDate();
  }

  endOfWeek() {
    this.date = endOfWeek(new Date(), { weekStartsOn: 1 });
    return this.toDate();
  }

  thisWeekQuery(column: string, searchCriteria?: SearchCriteria) {
    searchCriteria = searchCriteria || new SearchCriteria();
    searchCriteria.greaterEqThan(column, this.startOfWeek());
    searchCriteria.lessThan(column, this.endOfWeek());
    
    return searchCriteria;
  }

  thisWeek() {
    this.range = [
      this.startOfWeek(),
      this.endOfWeek(),
    ];
  }

  // This Month
  startOfMonth() {
    this.date = startOfMonth(new Date());
    return this.toDate();
  }

  endOfMonth() {
    this.date = endOfMonth(new Date());
    return this.toDate();
  }

  thisMonthQuery(column: string, searchCriteria?: SearchCriteria) {
    searchCriteria = searchCriteria || new SearchCriteria();
    searchCriteria.greaterEqThan(column, this.startOfMonth());
    searchCriteria.lessThan(column, this.endOfMonth());
    
    return searchCriteria;
  }

  thisMonth() {
    this.range = [
      this.startOfMonth(),
      this.endOfMonth(),
    ];
  }

  toDate() {
    return this.date;
  }
  
  toDateCollection() {
    const range = this.range.slice();
    let ret: Date[] = [];

    const [ start, end ] = range;

    if (isBefore(start, end)) {
      ret = [start, end];
    }
    else if (isBefore(end, start)) {
      ret = [end, start];
    }

    return ret;
  }
}