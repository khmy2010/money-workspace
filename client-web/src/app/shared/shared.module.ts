import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StandardDatePipe } from './pipes/sdate.pipe';
import { StandardCurrencyPipe } from './pipes/scurrency.pipe';

const EXPORTING_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatListModule,
  MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatDialogModule,
  MatCheckboxModule,
  MatCardModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatSelectModule,
  MatPaginatorModule
];

const EXPORTING_COMPONENTS: any[] = [
  // DatePickerComponent,
  StandardDatePipe,
  StandardCurrencyPipe,
  // SpinnerComponent,
  // CategoryTagComponent
];

@NgModule({
  declarations: [...EXPORTING_COMPONENTS],
  imports: [
    ...EXPORTING_MODULES
  ],
  exports: [
    ...EXPORTING_MODULES,
    ...EXPORTING_COMPONENTS
  ]
})
export class SharedModule { }
