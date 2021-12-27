import { Component, OnInit } from '@angular/core';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';

@Component({
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  constructor(private categoriesStoreService: CategoriesStoreService) { }

  ngOnInit(): void {
    this.categoriesStoreService.add({
      name: 'halo',
      color: 'world'
    });

    this.categoriesStoreService.findByUserSnapshot(true).then(console.log);
  }

}
