import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FAuditTrailModel } from 'src/app/firestore/model/store.model';
import { UserLogStoreService } from 'src/app/firestore/persistence/user-logs.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SearchCriteria } from 'src/app/firestore/criteria/search-criteria';
import { SearchDate } from 'src/app/firestore/criteria/search-date';

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
  mobileView: boolean = false;

  @ViewChild(MatTable) table!: MatTable<FAuditTrailModel>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private subHandler: SubHandlingService,
    private userLogStoreService: UserLogStoreService,
    private bpObserver: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    let dataRequest$!: Observable<FAuditTrailModel[]>;
    const AUDIT_DATE: string = 'auditDate';
    const searchCriteria: SearchCriteria = new SearchCriteria();
    const searchDate: SearchDate = new SearchDate();
    searchCriteria.equalsUser();

    if (this.bpObserver.isMatched(Breakpoints.XSmall)) {
      searchDate.thisWeek();
      this.mobileView = true;
    }
    else {
      searchDate.thisMonth();
      this.mobileView = false;
    }

    searchCriteria.buildRangeCriteria(AUDIT_DATE, searchDate);
    searchCriteria.desc(AUDIT_DATE);

    dataRequest$ = this.userLogStoreService.findBySearchCriteriaSnapshot(searchCriteria);

    this.subHandler.subscribe(
      dataRequest$.pipe(
        tap((auditTrailModels: FAuditTrailModel[]) => {
          this.dataSource.data = [...auditTrailModels];
          this.data = [...auditTrailModels];
        })
      )
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
