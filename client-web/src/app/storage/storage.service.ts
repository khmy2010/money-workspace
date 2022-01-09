import { Injectable } from "@angular/core";
import { getDownloadURL, ref, Storage, uploadBytesResumable, UploadMetadata } from '@angular/fire/storage';
import { Auth } from "@angular/fire/auth";
import format from 'date-fns/format';
import { catchError, from, Observable, of, Subject, take } from "rxjs";
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userId: string = this.auth.currentUser?.uid as string;

  constructor(private storage: Storage, private auth: Auth) {

  }

  uploadFile(path: string, file: File) {
    const uploadPath: string = `${this.userId}/uploads/${path}`;
    const storageRef = ref(this.storage, uploadPath);
    const metadata: any = {
      contentType: file.type,
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    const subject: Subject<number> = new Subject<number>();

    uploadTask.on('state_changed', 
     (snapshot) => {
       // Task Progress
       const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
       subject.next(progress);
     },
     (error) => {
        // https://firebase.google.com/docs/storage/web/handle-errors
        console.log(error);
     },
     () => {
       console.log(`Uploaded to Firebase Storage: ${path}`);
       subject.complete();
     });

     return subject;
  }

  getFileURLForDisplay(path: string): Observable<string | any> {
    const uploadPath: string = `${this.userId}/uploads/${path}`;
    const storageRef = ref(this.storage, uploadPath);

    return from(getDownloadURL(storageRef)).pipe(
      take(1),
      catchError(() => {
        
        return of(null);
      })
    );
  }

  saveFileWithCloudLink(link: string, fileName?: string) {
    saveAs(link, fileName);
  }

  genFileName(file: File, name: string) {
    const now = Date.now();
    const dateString = format(new Date(now), 'ddMMyyyy');
    const fileName = file.name;
    const fileFormat = fileName.substring(fileName.lastIndexOf('.') +1, fileName.length) || fileName;;

    return `${dateString}_${now}_${name}.${fileFormat}`;
  }

}

// TODO: https://github.com/firebase/functions-samples/blob/main/moderate-images/functions/index.js