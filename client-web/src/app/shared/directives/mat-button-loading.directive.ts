import { ComponentRef, Directive, Input, OnChanges, Renderer2, SimpleChanges, ViewContainerRef } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { ThemePalette } from "@angular/material/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Directive({
  selector: `
    button[mat-button][loading],
    button[mat-raised-button][loading],
    button[mat-icon-button][loading],
    button[mat-fab][loading],
    button[mat-mini-fab][loading],
    button[mat-stroked-button][loading],
    button[mat-flat-button][loading],
  `
})
export class MatButtonLoadingDirective implements OnChanges {
  @Input() loading: boolean = false;
  @Input() color: ThemePalette = 'warn';

  private spinner!: ComponentRef<MatProgressSpinner> | null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.loading) {
      return;
    }

    if (changes.loading) {
      if (this.loading) {
        this.nativeElement.classList.add('mat-loading');
        this.matButton.disabled = true;
        this.createSpinner();
      }
      else {
        this.nativeElement.classList.remove('mat-loading');
        this.matButton.disabled = false;
        this.destroySpinner();
      }
    }
  }

  constructor(
    private renderer: Renderer2,
    private matButton: MatButton, 
    private viewContainerRef: ViewContainerRef) {

  }

  get nativeElement(): HTMLElement {
    return this.matButton?._elementRef?.nativeElement;
  }

  private createSpinner(): void {
    if (!this.spinner) {
      this.spinner = this.viewContainerRef.createComponent(MatProgressSpinner);
      this.spinner.instance.diameter = 20;
      this.spinner.instance.mode = 'indeterminate';
      this.spinner.instance.color = this.color;
      this.renderer.appendChild(this.nativeElement, this.spinner.instance._elementRef.nativeElement);
    }
  }

  private destroySpinner(): void {
    if (this.spinner) {
      this.spinner.destroy();
      this.spinner = null;
    }
  }
}