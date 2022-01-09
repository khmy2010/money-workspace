import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { StorageService } from 'src/app/storage/storage.service';

@Component({
  selector: 'image-full-viewer',
  templateUrl: './full-viewer.component.html',
  styleUrls: ['./full-viewer.component.scss']
})
export class FullViewerComponent implements OnInit {
  @Input() imageFileName!: string;

  @Output() closed: EventEmitter<any> = new EventEmitter<any>();

  imageSource$!: Observable<string>;

  imagePath!: string;

  constructor(private storageService: StorageService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.imageFileName && this.imageFileName) {
      this.imageSource$ = this.storageService.getFileURLForDisplay(this.imageFileName).pipe(
        tap((imagePath: string) => {
          if (imagePath) {
            this.imagePath = imagePath;
          }
        })
      );
    }
  }

  ngOnInit(): void {
  }

  openNewTab() {
    if (this.imagePath) {
      window.open(this.imagePath, '_blank');
    }
  }

  save() {
    this.storageService.saveFileWithCloudLink(this.imagePath, this.imageFileName);
  }
}
