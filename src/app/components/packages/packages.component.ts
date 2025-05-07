import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PackagesService } from 'src/app/packages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { ItemsModalComponent } from '../items-modal/items-modal.component';

// const stripePromise = loadStripe(
//   'pk_test_51N2zfiBHAK3VyaqUHLxCAue1ZffFof5jE4X4lRfxvBqffzikRlcQTxj3Lrb3zbVgkmHSob3i2hidx0aQEP153HTM00rJFnDGJo'
// );

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  packages: any;
  stripe!: Stripe | null;
  elements!: StripeElements;
  card!: StripeCardElement;
  packageDetails: any
  packageId: any
  isLoading: boolean = false;


  constructor(
    private packageService: PackagesService,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.packageService.getAllPeckage().subscribe({
      next: (response: any) => {
        this.packages = response.items;
        console.log('packages', this.packages);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getItems(id: any){

    this.isLoading = true;

    this.packageService.getPackageById(id).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.packageDetails = response.data;
          this.isLoading = false;
          const modalRef = this.modalService.open(ItemsModalComponent);

          modalRef.componentInstance.packageDetails = this.packageDetails;
        } else {
          this.isLoading = false;
          console.warn('No data found in response');
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error fetching package details:', error);
      }
    );
  }

  // async ngAfterViewInit() {
  //   this.stripe = await stripePromise;
  //   if (!this.stripe) {
  //     console.error('Stripe failed to initialize.');
  //     return;
  //   }

  //   this.elements = this.stripe.elements();
  //   this.card = this.elements.create('card', {
  //     style: {
  //       base: {
  //         color: '#32325d',
  //         fontSize: '16px',
  //         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  //         fontSmoothing: 'antialiased',
  //         '::placeholder': {
  //           color: '#aab7c4',
  //         },
  //       },
  //       invalid: {
  //         color: '#fa755a',
  //         iconColor: '#fa755a',
  //       },
  //     },
  //   });
  //   this.card.mount('#card-element');
  // }

  // async BuyNow(price: number) {
  //   if (!this.stripe) {
  //     alert('Stripe has not been initialized.');
  //     return;
  //   }

  //   this.http
  //     .post('http://localhost:3000/payment/create-payment-intent', {
  //       amount: price * 100,
  //       currency: 'eur',
  //       userId: '676ebd9caa6ea87633c515c9', //will be made dynamic later
  //     })
  //     .subscribe({
  //       next: async (response: any) => {
  //         const clientSecret = response.clientSecret;

  //         // Confirm card payment
  //         const result = await this.stripe!.confirmCardPayment(clientSecret, {
  //           payment_method: {
  //             card: this.card,
  //           },
  //         });

  //         if (result?.error) {
  //           console.error('Payment failed:', result.error.message);
  //           alert('Payment failed: ' + result.error.message);
  //         } else if (result?.paymentIntent?.status === 'succeeded') {
  //           alert('Payment successful!');
  //         } else {
  //           alert('Payment could not be completed.');
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error creating payment intent:', error);
  //       },
  //     });
  // }
}
