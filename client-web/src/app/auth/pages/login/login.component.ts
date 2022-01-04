import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { interval, tap } from 'rxjs';
import { CloudFunctionService } from 'src/app/cloudfunction/cloud-function.service';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { RouteConstant } from 'src/constant';
import { environment } from 'src/environments/environment';
import { LocalDataSeederService } from '../../seed/local-seeder.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [SubHandlingService]
})
export class LoginComponent implements OnInit {
  @ViewChildren('cityImage') cityImages!: QueryList<HTMLElement>;

  imagePosition: string = '0%';
  currentDate: Date = new Date();
  mobileView: boolean = false;

  constructor(
    private bpObserver: BreakpointObserver,
    private subHandler: SubHandlingService,
    private auth: Auth,
    private router: Router,
    private localSeeder: LocalDataSeederService,
    private cfService: CloudFunctionService) {

  }

  ngOnInit(): void {
    this.mobileView = this.bpObserver.isMatched(Breakpoints.XSmall);
  }

  ngAfterViewInit() {
    const max = (this.cityImages.length - 1) * 100;
    let currentPosition = 0;

    this.subHandler.subscribe(
      interval(3000).pipe(
        tap(() => {
          if (currentPosition > max || (currentPosition + 100 > max)) {
            currentPosition = 0;
          }
          else {
            currentPosition = currentPosition + 100;
          }

          this.imagePosition = `-${currentPosition}%`;
        })
      )
    );
  }

  async login() {
    const userCredential: UserCredential = await signInWithPopup(this.auth, new GoogleAuthProvider());

    if (userCredential) {
      console.log('user login success: ', userCredential);
      const commands: string[] = [
        RouteConstant.APP,
        RouteConstant.DASHBOARD
      ];

      if (environment.useEmulators) {
        this.localSeeder.seedDataForDevelopment();
      }

      this.cfService.callLogin();
      this.router.navigate(commands);
    }
  }
}
