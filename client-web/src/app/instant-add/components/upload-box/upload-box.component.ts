import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FInstantAddType } from 'src/app/firestore/model/store.model';
import { StorageService } from 'src/app/storage/storage.service';

@Component({
  selector: 'rapid-upload-box',
  templateUrl: './upload-box.component.html',
  styleUrls: ['./upload-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UploadBoxComponent,
      multi: true
    }
  ]
})
export class UploadBoxComponent implements OnInit, ControlValueAccessor {
  @Input() type!: FInstantAddType;

  @Output() fileUploaded: EventEmitter<File> = new EventEmitter<File>();
  
  disabled: boolean = false;
  fileName!: string;

  @ViewChild('fileUpload') fileUploadButton!: ElementRef<HTMLElement>;

  private onChangeFn: any;
  private onTouchedFn: any;
  private file!: File;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
  }

  openFileUploadInterface() {
    if (this.fileUploadButton?.nativeElement) {
      this.fileUploadButton.nativeElement.click();
    }
  }

  onFileSelected(fileUploadElement: HTMLInputElement) {
    const fileList: FileList | null = fileUploadElement.files;

    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];

      if (file) {
        this.file = file;
        this.fileUploaded.emit(file);
        this.fileName = this.storageService.genFileName(file, 'rapid_entry');

        if (this.onChangeFn) {
          this.onChangeFn(this.fileName);
        }
      }
    }

    if (this.onTouchedFn) {
      this.onTouchedFn();
    }
  }

  registerOnChange(fn: any) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    
  }
}
