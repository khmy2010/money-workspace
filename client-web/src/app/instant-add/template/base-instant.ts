import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { concatMap, take } from "rxjs";
import { FInstantEntryModel } from "src/app/firestore/model/store.model";
import { InstantEntryService } from "src/app/firestore/persistence/instant-entry.service";
import { RapidConfigStoreService } from "src/app/firestore/persistence/rapid-config.service";
import { StorageService } from "src/app/storage/storage.service";

@Component({
  selector: '',
  template: ``,
})
export class BaseInstantTemplate {
  protected file!: File;

  constructor(
    protected fb: FormBuilder,
    protected storageService: StorageService,
    protected instantEntryService: InstantEntryService,
    protected rapidConfigStoreService: RapidConfigStoreService,) {

  }

  public syncFile(file: File) {
    this.file = file;
  }

  public precheck(form: FormGroup) {
    return form.valid && this.file && this.file.type.includes('image');
  }

  public uploadAndSubmit(payload: FInstantEntryModel) {
    return this.storageService.uploadFile(payload.fileName, this.file).pipe(
      concatMap(() => this.instantEntryService.add(payload)),
      take(1)
    );
  }
}