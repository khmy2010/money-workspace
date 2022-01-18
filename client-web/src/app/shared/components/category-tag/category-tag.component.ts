import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FCategoryModel } from 'src/app/firestore/model/store.model';

@Component({
  selector: 'app-category-tag',
  templateUrl: './category-tag.component.html',
  styleUrls: ['./category-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryTagComponent {
  @Input() category!: FCategoryModel | any;
  @Input() size: 'default' | 'small' = 'default';
}
