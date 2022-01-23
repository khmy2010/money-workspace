import { Injectable } from "@angular/core";
import { forkJoin, tap } from "rxjs";
import { FCategoryModel, FPaymentMethodModel, FRapidConfigModel, FRapidConfigType, FTransactionModel, FWalletConfigType } from "src/app/firestore/model/store.model";
import { CategoriesStoreService } from "src/app/firestore/persistence/categories.service";
import { PaymentMethodStoreService } from "src/app/firestore/persistence/payment-method.service";
import { TransactionStoreService } from "src/app/firestore/persistence/transaction.service";
import { environment } from "src/environments/environment";
import { categorySeeds } from "./categories.seed";
import { paymentMethodSeeds } from "./payment-method.seed";
import startOfToday from 'date-fns/startOfToday';
import { transactionRemarkSeeds } from "./transaction-remark.seed";
import { RapidConfigStoreService } from "src/app/firestore/persistence/rapid-config.service";
import { PlaceType1 } from "src/app/firestore/model/place.enum";
import { barberSeeds, entertainmentPlaceSeeds, foodSeeds, groceriesSeeds } from "./place.seed";

@Injectable({
  providedIn: 'root'
})
export class LocalDataSeederService {
  constructor(
    private categoriesStoreService: CategoriesStoreService,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private transactionStoreService: TransactionStoreService,
    private rapidConfigStoreService: RapidConfigStoreService,
  ) {

  }

  seedDataForDevelopment() {
    if (!environment.useEmulators) {
      return;
    }

    // Seed Categories
    this.categoriesStoreService.batchInsert(categorySeeds);

    // Seed Payment Methods
    this.paymentMethodStoreService.batchInsert(paymentMethodSeeds);

    setTimeout(() => {
      // Seed Transactions
      const data$ = forkJoin({
        categories: this.categoriesStoreService.findByUserSnapshot(),
        paymentMethods: this.paymentMethodStoreService.findByUserSnapshot(true)
      });

      data$.pipe(
        tap(({ categories, paymentMethods }) => {
          this.populateTransactions(categories, paymentMethods);
          this.populateTransactions(categories, paymentMethods);
          this.populateTransactions(categories, paymentMethods);
          this.populateTransactions(categories, paymentMethods);
          this.populateTransactions(categories, paymentMethods);
          this.populateRapidConfig(categories, paymentMethods);
          this,this.populateMerchantConfig(categories);
          this.populatePlaceConfig(categories);

        })
      ).subscribe();
    }, 5000);
  }

  addOneTransaction() {
    const data$ = forkJoin({
      categories: this.categoriesStoreService.findByUserSnapshot(),
      paymentMethods: this.paymentMethodStoreService.findByUserSnapshot(true)
    });


    data$.pipe(
      tap(({ categories, paymentMethods }) => {
        const category: FCategoryModel = categories[this.getRandomInt(0, categories.length - 1)];
        const paymentMethod: FPaymentMethodModel = paymentMethods[this.getRandomInt(0, paymentMethods.length - 1)];

        const transaction: FTransactionModel = {
          amount: this.getRandomInt(5, 200),
          category: category._id as string,
          paymentMethod: paymentMethod._id as string,
          remark: transactionRemarkSeeds[this.getRandomInt(0, transactionRemarkSeeds.length - 1)],
          transactionType: 'normal',
          transactionDate: this.getRandomDate(),
        };

        this.transactionStoreService.addByUser(transaction);
        console.log('added: ', transaction);
      })
    ).subscribe();
  }

  private populateRapidConfig(categories: FCategoryModel[], paymentMethod: FPaymentMethodModel[]) {
    const tngMock = paymentMethod.find(({ name }) => name === 'Touch \'n Go eWallet');

    if (tngMock) {
      const tngEWalletConfig: FRapidConfigModel = {
        configType: FRapidConfigType.EWALLET_CONFIG,
        value: tngMock._id,
        walletType: FWalletConfigType.TNG
      };

      this.rapidConfigStoreService.add(tngEWalletConfig);
    }

    const rfidMock = categories.find(({ name }) => name === 'Transportations');

    if (rfidMock) {
      const rfidConfig: FRapidConfigModel = {
        configType: FRapidConfigType.RFID_CONFIG,
        value: rfidMock._id
      };

      this.rapidConfigStoreService.add(rfidConfig);
    }
  }

  private populateMerchantConfig(categories: FCategoryModel[]) {
    categories.forEach((category: FCategoryModel) => {
      switch(category.name) {
        case 'Foods and Beverages':
          this.genMerchantConfig(category._id as string, 'HOCK MOON HIONG (SS2)');
          this.genMerchantConfig(category._id as string, 'RESTORAN 134 MIXED RICE');
          this.genMerchantConfig(category._id as string, 'BaWangChaJi Group Sdn Bhd');
          this.genMerchantConfig(category._id as string, 'RESTORAN YUK MING');
          this.genMerchantConfig(category._id as string, '7 Village Noodle Hse SS2');
          this.genMerchantConfig(category._id as string, 'Super Kitchen Chilli Panmee SS2');
          this.genMerchantConfig(category._id as string, 'Yun Kei Chicken Rice');
          break;
        case 'Groceries':
          this.genMerchantConfig(category._id as string, '99 SPEEDMART');
          this.genMerchantConfig(category._id as string, 'BERRY\'S - SS2');
          break;
      }
    });
  }

  private populatePlaceConfig(categories: FCategoryModel[]) {
    categories.forEach((category: FCategoryModel) => {
      switch(category.name) {
        case 'Entertainment':
          this.genPlaceConfig(category._id as string, entertainmentPlaceSeeds);
          break;
        case 'Barber':
          this.genPlaceConfig(category._id as string, barberSeeds);
          break;
        case 'Foods and Beverages':
          this.genPlaceConfig(category._id as string, foodSeeds);
          break;
        case 'Groceries':
          this.genPlaceConfig(category._id as string, groceriesSeeds);
          break;
      }
    });
  }

  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomDate() {
    const dayStart: Date = startOfToday();
    const now: Date = new Date();
    const space = now.getTime() - dayStart.getTime() - 1;

    if (space > 10000) {
      const timestamp = this.getRandomInt(0, space);
      if (timestamp > 0) {
        return new Date(dayStart.getTime() + timestamp);
      }
      else {
        return new Date();
      }
    }
    else {
      return new Date();
    }
  }

  private populateTransactions(categories: FCategoryModel[], paymentMethods: FPaymentMethodModel[]) {
    const minPaymentMethod: number = 0;
    const maxPaymentMethod: number = (paymentMethods?.length - 1) || 0;
    let transactions: FTransactionModel[] = [];

    categories.forEach((category: FCategoryModel) => {
      const transaction: FTransactionModel = {
        amount: this.getRandomInt(5, 200),
        category: category._id as string,
        paymentMethod: paymentMethods[this.getRandomInt(minPaymentMethod, maxPaymentMethod)]?._id as string,
        remark: transactionRemarkSeeds[this.getRandomInt(0, transactionRemarkSeeds.length - 1)],
        transactionType: 'normal',
        transactionDate: this.getRandomDate(),
      };

      transactions = transactions.slice(0, 50);

      transactions.push(transaction);
    });

    console.log(`[Local Seed] - Inserting ${transactions.length} rows into FDS.`);
    this.transactionStoreService.batchInsert(transactions);
  }

  private genMerchantConfig(category: string, merchantName: string) {
    const configModel: FRapidConfigModel = {
      configType: FRapidConfigType.MERCHANT_CONFIG,
      merchantName,
      value: category,
    };

    this.rapidConfigStoreService.add(configModel);
  }

  private genPlaceConfig(category: string, places: PlaceType1[]) {
    places.forEach((place: PlaceType1) => {
      const configModel: FRapidConfigModel = {
        configType: FRapidConfigType.PLACE_CONFIG,
        placeType: place,
        value: category,
      };

      this.rapidConfigStoreService.add(configModel);
    });
  }
}