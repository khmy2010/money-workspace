import { FPaymentMethodModel } from "src/app/firestore/model/store.model";
import { AppConstant } from "src/constant";

export const paymentMethodSeeds: FPaymentMethodModel[] = [
  {
    name: 'PBB Quantum Visa',
    status: AppConstant.ACTIVE,
    suffix: '6105',
    type: 'creditCard'
  },
  {
    name: 'PBB Visa Signature',
    status: AppConstant.ACTIVE,
    suffix: '1234',
    type: 'creditCard'
  },
  {
    name: 'SC Just One Platinum',
    status: AppConstant.ACTIVE,
    suffix: '7198',
    type: 'creditCard'
  },
  {
    name: 'Touch \'n Go eWallet',
    status: AppConstant.ACTIVE,
    type: 'ewallet'
  },
  {
    name: 'Grabpay eWallet',
    status: AppConstant.ACTIVE,
    type: 'ewallet'
  },
  {
    name: 'Boost eWallet',
    status: AppConstant.ACTIVE,
    type: 'ewallet'
  },
];