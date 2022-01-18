// Documentation: https://firebase.google.com/docs/firestore/query-data/queries#web-version-9_1 

import { where, QueryConstraint, CollectionReference, query, orderBy, limit, Query, WhereFilterOp, startAfter, endBefore, limitToLast, startAt } from "@angular/fire/firestore";
import { getAuth, Auth } from "firebase/auth";
import { AppConstant } from "src/constant";
import { SearchDate } from "./search-date";

export class SearchCriteria {
  public static readonly LESS_THAN: WhereFilterOp = '<';
  public static readonly LESS_THAN_OR_EQUAL_TO: WhereFilterOp = '<=';
  public static readonly EQUAL_TO: WhereFilterOp = '==';
  public static readonly GREATER_THAN: WhereFilterOp = '>';
  public static readonly GREATER_THAN_OR_EQUAL_TO: WhereFilterOp = '>=';
  public static readonly NOT_EQUAL_TO: WhereFilterOp = '!=';
  public static readonly ARRAY_CONTAINS: WhereFilterOp = 'array-contains';
  public static readonly ARRAY_CONTAINS_ANY: WhereFilterOp = 'array-contains-any';
  public static readonly IN: WhereFilterOp = 'in';
  public static readonly NOT_IN: WhereFilterOp = 'not-in';

  
  public static readonly STATUS_COL: string = 'status';
  public static readonly ACTIVE: string = AppConstant.ACTIVE;

  private criterias: QueryConstraint[] = [];
  private developmentMode: boolean = false;

  constructor(protected ref?: CollectionReference) {

  }

  equals(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.EQUAL_TO, value);
    this.criterias.push(query);
    return this;
  }

  equalsUser() {
    const auth: Auth = getAuth();
    const query: QueryConstraint = where('uid', SearchCriteria.EQUAL_TO, auth?.currentUser?.uid);
    this.criterias.push(query);
    return this;
  }

  
  notEqual(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.NOT_EQUAL_TO, value);
    this.criterias.push(query);
    return this;
  }

  lessThan(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.LESS_THAN, value);
    this.criterias.push(query);
    return this;
  }

  lessEqThan(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.LESS_THAN_OR_EQUAL_TO, value);
    this.criterias.push(query);
    return this;
  }

  greaterThan(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.GREATER_THAN, value);
    this.criterias.push(query);
    return this;
  }

  greaterEqThan(col: string, value: any) {
    const query: QueryConstraint = where(col, SearchCriteria.GREATER_THAN_OR_EQUAL_TO, value);
    this.criterias.push(query);
    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
  in(col: string, ...values: any[]) {
    // Use the in operator to combine up to 10 equality (==) clauses on the same field with a logical OR.
    const arrValues = this.handleRestValues(values);

    if (arrValues?.length > 10) {
      console.warn('in, not-in, and array-contains-any support up to 10 comparison values.');
    }

    const query: QueryConstraint = where(col, SearchCriteria.IN, arrValues);
    this.criterias.push(query);
    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
  notIn(col: string, ...values: any[]) {
    // Use the in operator to combine up to 10 equality (==) clauses on the same field with a logical OR.
    const arrValues = this.handleRestValues(values);;

    if (arrValues?.length > 10) {
      console.warn('in, not-in, and array-contains-any support up to 10 comparison values.');
    }

    const query: QueryConstraint = where(col, SearchCriteria.NOT_IN, arrValues);
    this.criterias.push(query);
    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/order-limit-data
  asc(col: string) {
    const query: QueryConstraint = orderBy(col);
    this.criterias.push(query);

    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/order-limit-data
  desc(col: string) {
    const query: QueryConstraint = orderBy(col, 'desc');
    this.criterias.push(query);

    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/order-limit-data
  limit(resultLimit: number) {
    const query: QueryConstraint = limit(+resultLimit);
    this.criterias.push(query);

    return this;
  }

  // https://firebase.google.com/docs/firestore/query-data/query-cursors#paginate_a_query
  startAfter(...cursor: unknown[]) {
    const query: QueryConstraint = startAfter(cursor);
    this.criterias.push(query);

    return this;
  }

  startAt(...cursor: unknown[]) {
    const query: QueryConstraint = startAt(cursor);
    this.criterias.push(query);

    return this;
  }

  endBefore(cursor: number) {
    const query: QueryConstraint = endBefore(+cursor);
    this.criterias.push(query);

    return this;
  }

  limitToLast(resultLimit: number) {
    const query: QueryConstraint = limitToLast(+resultLimit);
    this.criterias.push(query);

    return this;
  }
  
  active() {
    const query: QueryConstraint = where(SearchCriteria.STATUS_COL, SearchCriteria.EQUAL_TO, SearchCriteria.ACTIVE);
    this.criterias.push(query);
    return this;
  }

  buildRangeCriteria(col: string, searchDate: SearchDate) {
    if (searchDate.toDateCollection().length > 1) {
      const [ start, end ] = searchDate.toDateCollection();
      
      this.greaterEqThan(col, start);
      this.lessThan(col, end);
    }
  }

  buildCriteria() {
    return this.criterias;
  }

  build(): Query<any> {
    if (this.ref) {
      this.log('Final Query:', this.criterias, true);
      
      return query(this.ref, ...this.criterias);
    }
    else {
      return null as unknown as Query<any>;
    }
  }

  buildSafely(ref: CollectionReference): Query<any> {
    if (!this.ref) {
      this.ref = ref;
    }

    return this.build();
  } 

  // Used for Debugging Purpose
  enableDevelopmentMode() {
    this.developmentMode = true;

    return this;
  }

  private handleRestValues(...values: any) {
    let ret: any[] = [];

    this.log('handleRestValues original value', values);

    const arrValue = Array.isArray(values) ? values : [values];
    
    arrValue.forEach(ele => {
      if (Array.isArray(ele)) {
        ret = ret.concat(...ele);
      }
      else {
        ret = ret.concat(ele);
      }
    });

    this.log('handleRestValues processed value:', ret);

    return ret;
  }

  private log(msg: string, value: any, skipClone: boolean = false) {
    if (this.developmentMode) {
      const temp = skipClone ? value : JSON.parse(JSON.stringify(value));

      console.log(`[SC]: ${msg} `, temp);
    }
  }
}