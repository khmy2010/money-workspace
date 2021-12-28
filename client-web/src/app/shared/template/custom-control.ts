import { Component, forwardRef } from "@angular/core";
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  template: ''
})
export class CustomControlBase<T> {
  protected onChangeFn: any;
  protected onTouchFn: any;

  public disabled: boolean = false;

  registerOnChange(fn: any) {
    console.info('Custom control: onChangeFn registered successfully.');
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any) {
    console.info('Custom control: onTouchFn registered successfully.');
    this.onTouchFn = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  public onValueChanged(value: T) {
    if (value !== undefined && value !== null && this.onTouchFn && this.onChangeFn) {
      this.onTouchFn();
      this.onChangeFn(value);
    }
  }

  public onTouch() {
    if (this.onTouchFn) {
      this.onTouchFn();
    }
  }
}

export const DEFAULT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};
