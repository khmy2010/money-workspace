import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { concatMap, take, tap } from "rxjs";
import { FInstantEntryModel } from "src/app/firestore/model/store.model";
import { InstantEntryService } from "src/app/firestore/persistence/instant-entry.service";
import { RapidConfigStoreService } from "src/app/firestore/persistence/rapid-config.service";
import { StorageService } from "src/app/storage/storage.service";
import { RouteConstant } from "src/constant";

@Component({
  selector: '',
  template: ``,
})
export class BaseInstantTemplate {
  protected file!: File;
  
  public submitting: boolean = false;

  constructor(
    private matSnackBar: MatSnackBar,
    protected fb: FormBuilder,
    protected storageService: StorageService,
    protected instantEntryService: InstantEntryService,
    protected rapidConfigStoreService: RapidConfigStoreService,
    protected router: Router,
    protected route: ActivatedRoute) {

  }

  public syncFile(file: File) {
    this.file = file;
  }

  public precheck(form: FormGroup) {
    return form.valid && this.file && this.file.type.includes('image');
  }

  public uploadAndSubmit(payload: FInstantEntryModel) {
    this.submitting = true;

    return this.storageService.uploadFile(payload.fileName, this.file).pipe(
      concatMap(() => this.instantEntryService.add(payload)),
      take(1),
      tap(() => {
        this.submitting = false;

        const config: MatSnackBarConfig = {
          panelClass: 'text-white',
          duration: 1000
        };

        this.matSnackBar.open(`${this.file.name} uploaded to server for instant transaction processing.`, undefined, config);

        const extras: NavigationExtras = {
          queryParams: {
            new: true
          },
          relativeTo: this.route.parent
        };
        
        this.router.navigate([RouteConstant.INSTANT_PROCESS_RECORD], extras);
      })
    );
  }
}