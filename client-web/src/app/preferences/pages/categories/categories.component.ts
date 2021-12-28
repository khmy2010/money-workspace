import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { SearchCriteria } from 'src/app/firestore/criteria/search-criteria';
import { FCategoryModel } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';

@Component({
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  providers: [SubHandlingService]
})
export class CategoriesComponent implements OnInit {
  categoriesForm: FormGroup = this.fb.group({
    categories: this.fb.array([])
  });

  loading: boolean = true;
  creating: boolean = false;
  length: number = 0;
  categoriesString: string = '';

  constructor(private fb: FormBuilder, private categoriesStoreService: CategoriesStoreService, private subHandler: SubHandlingService) { }

  ngOnInit(): void {
    const searchCriteria: SearchCriteria = new SearchCriteria().equalsUser().asc('name');

    this.subHandler.subscribe(
      this.categoriesStoreService.findBySearchCriteria(searchCriteria).pipe(
        tap((categories: FCategoryModel[]) => {
          this.categories.clear();
          categories.forEach((category) => this.pushFormGroup(category));
          this.pushFormGroup();
          this.length = categories?.length ?? 0; 
          
          if (categories.length > 0) {
            this.categoriesString = categories.map(({ name }) => name).join(', ');
          }
          else {
            this.categoriesString = '';
          }
        })
      )
    );
  }
  

  create(index: number) {
    const fg: FormGroup = this.categories.at(index) as FormGroup;

    const payload: FCategoryModel = {
      name: fg.value.name,
      color: fg.value.color
    };

    this.creating = true;

    this.categoriesStoreService.add(payload);
  }

  update(index: number) {
    const fg: FormGroup = this.categories.at(index) as FormGroup;

    if (fg) {
      const id: string = fg.get('id')?.value;

      if (id) {
        const payload: FCategoryModel = {
          name: fg.value.name,
          color: fg.value.color
        };

        this.categoriesStoreService.update(id, payload);
      }
    }
  }

  delete(index: number) {
    const fg: FormGroup = this.categories.at(index) as FormGroup;

    if (fg) {
      const id: string = fg.get('id')?.value;

      if (id) {
        this.categoriesStoreService.delete(id);
      }
    }
  }

  get categories(): FormArray {
    return this.categoriesForm.get('categories') as FormArray;
  }

  private pushFormGroup(value?: FCategoryModel) {
    this.categories?.push(
      this.fb.group({
        name: [value ? value.name : ''],
        color: [value?.color ?? '#000000'],
        submitting: [false],
        persisted: [!!value],
        id: [value?._id]
      })
    );
  }
}
