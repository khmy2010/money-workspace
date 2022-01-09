import { Subject, take } from "rxjs"

export const readURL = (file: File) => {
  const imageSubject: Subject<string> = new Subject<string>();

  const reader: FileReader = new FileReader();

  reader.onload = (e: any) => {
    const base64String = e?.target?.result;

    if (base64String) {
      imageSubject.next(base64String);
      imageSubject.complete();
    }
  };

  reader.readAsDataURL(file);

  return imageSubject.pipe(
    take(1)
  );
}