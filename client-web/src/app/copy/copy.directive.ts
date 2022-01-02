import { Clipboard } from "@angular/cdk/clipboard";
import { Directive, HostListener, Input } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

@Directive({
  selector: '[copyClipboard]'
})
export class CopyDirective {
  @Input() copyClipboard!: string;

  constructor(private clipboard: Clipboard, private matSnackBar: MatSnackBar) {

  }

  @HostListener('click', ['$event.target'])
  copyText() {
    if (this.clipboard.copy(this.copyClipboard)) {
      const config: MatSnackBarConfig = {
        panelClass: 'text-white',
        duration: 1000
      };

      this.matSnackBar.open(`Copied ${this.copyClipboard} to clipboard.`, undefined, config);
    }
  }
}