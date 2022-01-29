import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { filter, fromEvent, map, Observable, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FInstantAddType } from 'src/app/firestore/model/store.model';
import { StorageService } from 'src/app/storage/storage.service';
import { readURL } from 'src/app/utils/image';

@Component({
  selector: 'rapid-upload-box',
  templateUrl: './upload-box.component.html',
  styleUrls: ['./upload-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UploadBoxComponent,
      multi: true
    },
    SubHandlingService
  ]
})
export class UploadBoxComponent implements OnInit, ControlValueAccessor {
  @Input() type!: FInstantAddType;

  @Output() fileUploaded: EventEmitter<File> = new EventEmitter<File>();
  
  disabled: boolean = false;
  fileName!: string;
  previewFile$!: Observable<string>;
  file!: File;

  @ViewChild('fileUpload') fileUploadButton!: ElementRef<HTMLElement>;

  private onChangeFn: any;
  private onTouchedFn: any;

  constructor(
    private storageService: StorageService,
    private subHandler: SubHandlingService,
  ) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      fromEvent(document, 'paste').pipe(
        map((event: any) => {
          return event as ClipboardEvent;
        }),
        map((clipboardEvent: ClipboardEvent) => {
          const clipboardData = clipboardEvent.clipboardData || (window as any)?.clipboardData;
  
          if (clipboardData && clipboardData?.files) {
            return clipboardData?.files[0];
          }
  
          return null;
        }),
        filter((pastedFile: File) => !!pastedFile),
        tap((file: File) => {
          this.handleFileAdded(file);
        })
      )
    );
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
        this.handleFileAdded(file);
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

  private handleFileAdded(file: File) {
    this.file = file;
    this.fileUploaded.emit(file);
    this.fileName = this.storageService.genFileName(file, 'rapid_entry');
    this.previewFile$ = readURL(file);

    if (this.onChangeFn) {
      this.onChangeFn(this.fileName);
    }
  }
}
