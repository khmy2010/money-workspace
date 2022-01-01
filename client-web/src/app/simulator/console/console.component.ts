import { Component, OnInit } from '@angular/core';
import { LocalDataSeederService } from 'src/app/auth/seed/local-seeder.service';
import { CloudFunctionService } from 'src/app/cloudfunction/cloud-function.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {

  constructor(
    private cfService: CloudFunctionService,
    private localDataSeederService: LocalDataSeederService) { }

  ngOnInit(): void {

  }


  addTransaction() {
    this.localDataSeederService.addOneTransaction();
  }

  callLogin() {
    this.cfService.callLogin().subscribe();
  }
}
