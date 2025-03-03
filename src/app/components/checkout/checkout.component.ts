import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Stripe, StripeElements, StripeCardElement, loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_51N2zfiBHAK3VyaqUHLxCAue1ZffFof5jE4X4lRfxvBqffzikRlcQTxj3Lrb3zbVgkmHSob3i2hidx0aQEP153HTM00rJFnDGJo'
);

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  stripe!: Stripe | null;
  elements!: StripeElements;
  card!: StripeCardElement;
  advance= 0;
  packageName: string = '';
  packageId!: any;
  checkoutPrice = 0;
  infoForm!: FormGroup;
  cardValid: boolean = false;
  noOfPersons!:any
  totalPrice!:any
  fromDate!:any
  toDate!:any
  subItems!:any

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // this.checkoutPrice = parseFloat(this.advance);

    this.route.queryParams.subscribe(params => {
      this.advance = params['advance'];
      this.packageName = params['packageName'];
      this.packageId = params['packageId'];
      this.noOfPersons = params['noOfPersons'];
      this.totalPrice = params['totalPrice'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.subItems = JSON.parse(params['subItems']);
    });
    console.log('this.advance',this.advance)
    console.log('this.packageName',this.packageName)
    console.log('this.packageId',this.packageId)
    console.log('this.noOfPersons',this.noOfPersons)
    console.log('this.totalPrice',this.totalPrice)
    console.log('this.fromDate',this.fromDate)
    console.log('this.toDate',this.toDate)
    console.log('this.subItems',this.subItems)
    // console.log(this.total)

    this.initForm();
  }

  initForm(): void {
    this.infoForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,15}$/)]
      ]
    });
  }

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await stripePromise;
    if (!this.stripe) {
      console.error('Stripe failed to initialize.');
      return;
    }

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');

    // Listen for card changes and validate
    this.card.on('change', (event) => {
      const displayError = document.getElementById('card-errors');
      this.ngZone.run(() => {
        if (event.error) {
          displayError!.textContent = event.error.message;
          this.cardValid = false;
        } else {
          displayError!.textContent = '';
          this.cardValid = event.complete;
        }
      });
    });
  }

  async onCheckout(): Promise<void> {
    console.log(this.infoForm.value)
    console.log('card', this.cardValid)

    this.http.post('https://a684-154-192-1-94.ngrok-free.app/payment/create-payment-intent', {
      amount: this.advance * 100,
      currency: 'eur',
      userId: '676ebd9caa6ea87633c515c9',
      userInfo: this.infoForm.value,
      packageId: this.packageId,
      packageName: this.packageName,
      noOfPersons: this.noOfPersons,
      totalPrice: this.totalPrice,
      fromDate: this.fromDate,
      toDate: this.toDate,
      subItems: this.subItems
    }).subscribe({
      next: async (response: any) => {
        const clientSecret = response.clientSecret;

        const result = await this.stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card
          }
        });

        if (result?.error) {
          console.error('Payment failed:', result.error.message);
          alert('Payment failed: ' + result.error.message);
        } else if (result?.paymentIntent?.status === 'succeeded') {
          alert('Payment successful!');
        } else {
          alert('Payment could not be completed.');
        }
      },
      error: (error) => {
        console.error('Error creating payment intent:', error);
      }
    });
  }
}
