import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { distinctUntilChanged, filter, interval, map, Observable, startWith, tap } from 'rxjs';
import { CloudFunctionService } from 'src/app/cloudfunction/cloud-function.service';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FUserModel } from 'src/app/firestore/model/store.model';
import { UserStoreService } from 'src/app/firestore/persistence/user.service';
import { RouteConstant } from 'src/constant';
import { IStructureModel, siteStructure } from './structure';

@Component({
  selector: 'app-navigation-drawer',
  templateUrl: './navigation-drawer.component.html',
  styleUrls: ['./navigation-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubHandlingService]
})
export class NavigationDrawerComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() user!: User;

  @Output() showChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  greeting!: string;
  userDocument$!: Observable<FUserModel>;
  siteMap: IStructureModel[] = siteStructure;

  constructor(
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private subHandler: SubHandlingService,
    private userStoreService: UserStoreService,
    private auth: Auth,
    private router: Router,
    private cfService: CloudFunctionService,
  ) { }

  ngOnInit(): void {
    console.log('user: ', this.user);
    
    this.greetUser();
    this.userDocument$ = this.userStoreService.get(this.user.uid);
    this.userDocument$.subscribe(console.log);
  }

  closeDrawer() {
    this.show = false;
    this.showChange.emit(this.show);
  }

  async signOut() {
    this.cfService.callLogout();
    
    await signOut(this.auth);

    this.router.navigate([
      RouteConstant.PUBLIC,
      RouteConstant.AUTH,
      RouteConstant.LOGIN,
    ]);
  }

  private greetUser() {
    // initial greeting
    this.greeting = this.determineGreeting();
    this.cdRef.markForCheck();

    this.ngZone.runOutsideAngular(() => {
      // Recalculate every half minute
      this.subHandler.subscribe(
        interval(30000).pipe(
          map(() => this.determineGreeting()),
          distinctUntilChanged(),
          filter((greeting: string) => this.greeting != greeting),
          tap((greeting: string) => {
            this.ngZone.run(() => {
              this.greeting = greeting;
              this.cdRef.markForCheck();
            });
          })
        )
      );
    });
  }

  private determineGreeting() {
    const currentHour: number = new Date().getHours();
    const userName: string | null = this.user?.displayName || '';

    switch(true) {
      case currentHour < 12:
        return `Good Morning, ${userName}`;
      case currentHour < 18:
        return `Good Afternoon, ${userName}`;
      default:
        return `Good Evening, ${userName}`;
    }

  }
}

