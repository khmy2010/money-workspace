import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserLogStoreService } from 'src/app/firestore/persistence/user-logs.service';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {
  displayedColumns: string[] = [
    'entryPoint', 
    'eventType', 
    'module', 
    'action', 
    'auditDate', 
  ];
  
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userLogStoreService: UserLogStoreService) { }

  ngOnInit(): void {
    this.userLogStoreService.findByUserSnapshot().subscribe(console.log);
  }

  readPaginatedData(pageEvent: PageEvent) {
    console.log('page event? ', pageEvent);
  }
}
