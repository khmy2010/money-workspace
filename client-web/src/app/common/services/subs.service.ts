import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription, takeUntil } from "rxjs";

@Injectable()
export class SubHandlingService {
  private destroy = new Subject<any>();

  subscribe<T>(o: Observable<T>): Subscription {
    const ret$: Observable<T> = o.pipe(
      takeUntil(this.destroy)
    );

    return ret$.subscribe();
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
    this.destroy.unsubscribe();
  }
}