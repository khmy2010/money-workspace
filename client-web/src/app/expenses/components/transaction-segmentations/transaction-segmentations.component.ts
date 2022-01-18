import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { FTransactionModel } from 'src/app/firestore/model/store.model';

@Component({
  selector: 'transaction-segmentations',
  templateUrl: './transaction-segmentations.component.html',
  styleUrls: ['./transaction-segmentations.component.scss']
})
export class TransactionSegmentationsComponent implements OnInit {
  @Input() data: FTransactionModel[] | any = [];
  @Input() sum: number = 0;

  categorySegmentationsOptions: Highcharts.Options = {
    chart: {
      type: 'pie'
    },
    series: [{
      data: [],
      type: 'pie'
    }],
    credits: {
      enabled: false
    },
    title: {
      text: undefined
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: false
        }
      }
    }
  };

  tableColumns: string[] = [
    'name',
    'sum',
    'percentage'
  ];

  chartData!: any;
  updateFlag: boolean = false;

  readonly Highcharts = Highcharts;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && Array.isArray(this.data)) {
      const chartData: any[] = this.groupByCategories(this.data);
      this.chartData = [...chartData];

      this.categorySegmentationsOptions.series = [
        {
          data: chartData ?? [],
          type: 'pie'
        }
      ];

      this.updateFlag = true;
    }
  }

  ngOnInit(): void {
  }

  sortTable(sortState: any) {
    console.log('Sort State: ', sortState);
  }

  private groupByCategories(transactions: FTransactionModel[]): any {
    const mappedObject: any = {};

    transactions.forEach((transaction: FTransactionModel) => {
      mappedObject[transaction.category] = transaction.amount + (mappedObject[transaction.category] ?? 0);
    });

    return Object.keys(mappedObject).map((category: string) => {
      const transaction = transactions.find(({ categoryDocument }) => {
        return categoryDocument?._id === category;
      });

      if (transaction) {
        return {
          y: mappedObject[category],
          name: transaction?.categoryDocument?.name,
          color: transaction?.categoryDocument?.color,
          allocation: mappedObject[category] / this.sum,
        };
      }

      return null;
    }).filter((data: any) => !!data).sort((a: any, b: any) => {
      if (a.y > b.y) {
        return -1;
      }

      if (a.y < b.y) {
        return 1;
      }

      return 0;
    });
  }
}
