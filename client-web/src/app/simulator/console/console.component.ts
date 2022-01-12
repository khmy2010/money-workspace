import { Component, OnInit } from '@angular/core';
import { LocalDataSeederService } from 'src/app/auth/seed/local-seeder.service';
import { CloudFunctionService } from 'src/app/cloudfunction/cloud-function.service';
import { StorageService } from 'src/app/storage/storage.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private cfService: CloudFunctionService,
    private localDataSeederService: LocalDataSeederService) { }

  ngOnInit(): void {

  }


  addTransaction() {
    this.localDataSeederService.addOneTransaction();
  }

  callLogin() {
    this.cfService.callLogin().subscribe();
  }

  onFileSelected(fileUploadElement: HTMLInputElement) {
    const fileList: FileList | null = fileUploadElement.files;

    if (fileList && fileList.length > 0) {
      const uploadFile: File = fileList[0];
      const fileName: string = this.storageService.genFileName(uploadFile, 'rapid_entry');
      this.storageService.uploadFile(fileName, uploadFile);
    }
  }
}
