import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { PlaceType1, PlaceType2 } from 'src/app/firestore/model/place.enum';
import { FCategoryModel, FRapidConfigModel, FRapidConfigType } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';
import { RapidConfigStoreService } from 'src/app/firestore/persistence/rapid-config.service';

@Component({
  templateUrl: './place-mapping.component.html',
  styleUrls: ['./place-mapping.component.scss'],
  providers: [SubHandlingService]
})
export class PlaceMappingComponent implements OnInit {
  places: Partial<FRapidConfigModel>[] = [];
  placesForm: FormGroup = this.fb.group({
    places: this.fb.array([])
  });
  categories: FCategoryModel[] = [];

  constructor(
    private subHandler: SubHandlingService,
    private rapidConfigStoreService: RapidConfigStoreService,
    private fb: FormBuilder,
    private categoryStoreService: CategoriesStoreService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      this.categoryStoreService.findByUserSnapshot(true).pipe(
        tap((categories: FCategoryModel[]) => {
          this.categories = [...categories];
        })
      )
    );

    this.initialisePlaceData();

    this.subHandler.subscribe(
      this.rapidConfigStoreService.findPlacesConfig().pipe(
        tap((configs: FRapidConfigModel[]) => {
          configs.forEach((config: FRapidConfigModel) => {
            const placeIndex: number = this.places.findIndex(({ placeType }) => placeType === config.placeType);

            if (placeIndex > -1) {
              this.places[placeIndex] = {
                ...this.places[placeIndex],
                ...config
              };
            }
          });

          this.initialiseForm();
        })
      )
    );
  }

  savePlaceConfig(index: number) {
    const form: FormGroup = this.placesConfigForm.at(index) as FormGroup;

    if (form.invalid) {
      return;
    }

    const { value } = form.value;

    const placeConfig: Partial<FRapidConfigModel> | undefined = this.places.find(({ placeType }) => placeType === form.value.placeType);

    if (!placeConfig) {
      return;
    }

    const config: MatSnackBarConfig = {
      panelClass: 'text-white',
      duration: 1000
    };

    let req$!: Observable<any>;
    const payload: FRapidConfigModel = {
      configType: FRapidConfigType.PLACE_CONFIG,
      placeType: placeConfig.placeType as string,
      value,
    };

    if (placeConfig._id) {
      req$ = this.rapidConfigStoreService.upsert(placeConfig._id, payload).pipe(
        tap(() => {
          this.matSnackBar.open(`Updated Place Config for ${placeConfig.placeDisplayName}.`, undefined, config);
        })
      );
    }
    else {
      req$ = this.rapidConfigStoreService.add(payload).pipe(
        tap(() => {
          this.matSnackBar.open(`Created Place Config for ${placeConfig.placeDisplayName}.`, undefined, config);
        })
      );
    }

    this.subHandler.subscribe(req$);
  }

  get placesConfigForm(): FormArray {
    return this.placesForm.get('places') as FormArray;
  }

  private initialiseForm() {
    this.placesConfigForm.clear();
    this.placesConfigForm.reset();
    this.places.forEach((place: Partial<FRapidConfigModel>) => {
      const { placeType, placeDisplayName, _id, value  } = place;

      const formGroup: FormGroup = this.fb.group({
        placeType,
        placeDisplayName,
        value: [value ?? null, [Validators.required]],
        persisted: _id && value
      });

      this.placesConfigForm.push(formGroup);
    });
  }

  private initialisePlaceData() {
    Object.keys(PlaceType1).map((enumKey: string) => {
      const placeValue: string = PlaceType1[enumKey as keyof typeof PlaceType1];
      const displayValue: string = placeValue.split('_').map((segment: string) => {
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      }).join(' ');

      this.places.push({
        configType: FRapidConfigType.PLACE_CONFIG,
        placeType: placeValue,
        placeDisplayName: displayValue,
        googlePlaceType: 'PlaceType1',
      });
    });

    Object.keys(PlaceType2).map((enumKey: string) => {
      const placeValue: string = PlaceType2[enumKey as keyof typeof PlaceType2];
      const displayValue: string = placeValue.split('_').map((segment: string) => {
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      }).join(' ');

      this.places.push({
        configType: FRapidConfigType.PLACE_CONFIG,
        placeType: placeValue,
        placeDisplayName: displayValue,
        googlePlaceType: 'PlaceType2',
      });
    });

    this.places = this.places.sort((a, b) => {
      return a.placeDisplayName?.localeCompare(b.placeDisplayName as string) as number;
    });

    console.log('this.places: ', this.places);
  }
}
