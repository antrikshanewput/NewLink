import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getQueryData(query?: any): any {
    console.log(`Query Params: ${JSON.stringify(query)}`);
    return { message: 'Hello World!' };
  }

  getBodyData(body?: any): any {
    console.log(`Body Params: ${JSON.stringify(body)}`);
    return {
      abc: {
        internalRequestId: 12369267111,
        status: 'SUCCESS',
        errCode: 0,
        reason: '',
        merchantId: '4555477667712192074',
        merchantSiteId: '233218',
        version: '1.0',
        clientRequestId: '99eb2d9f-d578-4ec9-b153-a6636d9b7bea',
        sessionToken: 'e76f3ded-b68a-499e-8c44-a8e1cfa2acf3',
        orderId: '2532399111',
        userTokenId: '230811147',
        paymentOption: {
          userPaymentOptionId: '684660111',
          card: {
            ccCardNumber: '4****1390',
            bin: '476134',
            last4Digits: '1390',
            ccExpMonth: '12',
            ccExpYear: '30',
            acquirerId: '19',
            cvv2Reply: '',
            avsCode: '',
            cardType: 'Credit',
            issuerBankName: 'INTL HDQTRS-CENTER OWNED',
            issuerCountry: 'SG',
            isPrepaid: 'false',
            threeD: {},
          },
          paymentAccountReference: 'f4iK2pnudYKvTALGdcwEzqj9p4',
        },
        transactionStatus: 'APPROVED',
        gwErrorCode: 0,
        gwExtendedErrorCode: 0,
        issuerDeclineCode: '',
        issuerDeclineReason: '',
        transactionType: 'Auth',
        transactionId: '8110000000006236969',
        externalTransactionId: '',
        authCode: '111459',
        customData: '',
        fraudDetails: {
          finalDecision: 'Accept',
        },
        externalSchemeTransactionId: '',
        merchantAdviceCode: '',
      },
      internalRequestId: 12369267111,
      status: 'SUCCESS',
      errCode: 0,
      reason: '',
      merchantId: '4555477667712192074',
      merchantSiteId: '233218',
      version: '1.0',
      clientRequestId: '99eb2d9f-d578-4ec9-b153-a6636d9b7bea',
      sessionToken: 'e76f3ded-b68a-499e-8c44-a8e1cfa2acf3',
      orderId: '2532399111',
      userTokenId: '230811147',
      paymentOption: {
        userPaymentOptionId: '684660111',
        card: {
          ccCardNumber: '4****1390',
          bin: '476134',
          last4Digits: '1390',
          ccExpMonth: '12',
          ccExpYear: '30',
          acquirerId: '19',
          cvv2Reply: '',
          avsCode: '',
          cardType: 'Credit',
          issuerBankName: 'INTL HDQTRS-CENTER OWNED',
          issuerCountry: 'SG',
          isPrepaid: 'false',
          threeD: {},
        },
        paymentAccountReference: 'f4iK2pnudYKvTALGdcwEzqj9p4',
      },
      transactionStatus: 'APPROVED',
      gwErrorCode: 0,
      gwExtendedErrorCode: 0,
      issuerDeclineCode: '',
      issuerDeclineReason: '',
      transactionType: 'Auth',
      transactionId: '8110000000006236969',
      externalTransactionId: '',
      authCode: '111459',
      customData: '',
      fraudDetails: {
        finalDecision: 'Accept',
      },
      externalSchemeTransactionId: '',
      merchantAdviceCode: '',
    };
  }
}
