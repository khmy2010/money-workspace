import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent implements OnInit {
  websiteUrl: string = `${window.location.protocol}//${window.location.hostname}`;

  constructor() { }

  ngOnInit(): void {
  }

}
