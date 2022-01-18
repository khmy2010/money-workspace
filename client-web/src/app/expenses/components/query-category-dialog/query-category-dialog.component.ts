import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, take, tap } from 'rxjs';
import { FCategoryModel } from 'src/app/firestore/model/store.model';

@Component({
  selector: 'query-category-dialog',
  templateUrl: './query-category-dialog.component.html',
  styleUrls: ['./query-category-dialog.component.scss']
})
export class QueryCategoryDialogComponent implements OnInit {
  categories: QueryCategoryModel[] = [];
  allSelected: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: QueryCategoryDialogData,
    private dialogRef: MatDialogRef<QueryCategoryDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.data.categories$.pipe(
      tap((categories: FCategoryModel[]) => {
        const currentSelected: string[] = this.data.current || [];

        this.categories = [...categories].map((category: FCategoryModel) => {
          if (currentSelected.length === 0) {
            return {
              ...category,
              checked: true
            }
          }

          return {
            ...category,
            checked: currentSelected.includes(category._id as string)
          }
        });

        this.updateAllSelected();
      })
    ).subscribe();
  }

  updateAllSelected() {
    this.allSelected = Array.isArray(this.categories) && this.categories.every(({ checked }) => !!checked);
  }

  someFilter(): boolean {
    if (this.categories.length === 0) {
      return false;
    }

    return this.categories.filter(({ checked }) => !!checked).length > 0 && !this.allSelected;
  }

  setAll(selected: boolean) {
    this.allSelected = selected;

    if (this.categories.length > 0) {
      this.categories.forEach((category) => {
        category.checked = selected;
      });
    }
  }

  confirmFilter() {
    const chosenCategories: QueryCategoryModel[] = this.categories.filter(({ checked, _id }) => !!checked && _id);
    const chosenCategoriesId: string[] = chosenCategories.map(({ _id }) => _id) as string[];

    this.dialogRef.close({
      categories: this.allSelected && chosenCategoriesId.length === this.categories.length ? [] : chosenCategoriesId
    });
  }
}

export interface QueryCategoryDialogData {
  categories$: Observable<FCategoryModel[]>
  current: string[]
}

interface QueryCategoryModel extends FCategoryModel {
  checked: boolean;
}