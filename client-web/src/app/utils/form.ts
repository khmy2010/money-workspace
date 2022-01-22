import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

/**
 * recursively mark controls under a form group as dirty and update its form state.
 * @param fg form group to checked
 */
export const checkFormGroup = (fg: FormGroup) => {
  for (let i in fg.controls) {
    fg.controls[i].markAsTouched();
    fg.controls[i].markAsDirty();
    fg.controls[i].updateValueAndValidity();
  }
};

/**
 * disable fields in a form group.
 * @param fg FormGroup
 * @param fields fields that about to be disabled
 * @example disableFields(this.form, 'fieldA', 'fieldB');
 */
export const disableFields = (fg: FormGroup, ...fields: any) => {
  fields.forEach((field: string) => {
    fg.get(field)?.disable({ emitEvent: false });
  });
};

/**
 * enable fields in a form group.
 * @param fg FormGroup
 * @param fields fields that about to be enabled
 * @example enableFields(this.form, 'fieldA', 'fieldB');
 */
export const enableFields = (fg: FormGroup, ...fields: any) => {
  fields.forEach((field: string) => {
    fg.get(field)?.enable({ emitEvent: false });
  });
};

/**
 * disable entire form array
 * @param fa FormArray
 */
export const disableFormArray = (fa: FormArray) => {
  fa.controls.forEach((controlArrayElement: AbstractControl) => {
    if (controlArrayElement instanceof FormGroup) {
      const fg: FormGroup = controlArrayElement as FormGroup;

      if (fg?.controls) {
        for (let i in fg.controls) {
          fg.controls[i].disable();
        }
      }
    } else if (controlArrayElement instanceof FormArray) {
      disableFormArray(controlArrayElement);
    } else {
      controlArrayElement.disable();
    }
  });

  fa.disable();
};
