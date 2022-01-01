import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subject, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FAuditTrailModel } from 'src/app/firestore/model/store.model';
import { MetaStoreService } from 'src/app/firestore/persistence/meta.service';
import { UserLogStoreService } from 'src/app/firestore/persistence/user-logs.service';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss'],
  providers: [SubHandlingService],
  encapsulation: ViewEncapsulation.None
})
export class ActivityLogsComponent implements OnInit {
  displayedColumns: string[] = [
    'entryPoint',
    'module', 
    'action', 
    'auditDate', 
  ];
  
  data: FAuditTrailModel[] = [];
  dataCount: number = 0;
  loading: boolean = false;
  pageSizeOptions: number[] = [10, 25, 100];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatTable) table!: MatTable<FAuditTrailModel>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private userLogSubject: Subject<number> = new Subject<number>();

  constructor(
    private subHandler: SubHandlingService,
    private userLogStoreService: UserLogStoreService, 
    private metaStoreService: MetaStoreService) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      this.userLogStoreService.findByUserSnapshot().pipe(
        tap((auditTrailModels: FAuditTrailModel[]) => {
          this.dataSource.data = [...auditTrailModels];
        })
      )
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
