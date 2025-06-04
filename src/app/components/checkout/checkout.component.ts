import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Stripe, StripeElements, StripeCardElement, loadStripe } from '@stripe/stripe-js';
import { ToastrService } from 'ngx-toastr';

const stripePromise = loadStripe(
  'pk_test_Kkgs1LAJBmrCbnnyEJDATR4600m1UIGnsQ'
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
  advance = 0;
  packageName: string = '';
  packageId!: any;
  checkoutPrice = 0;
  infoForm!: FormGroup;
  cardValid: boolean = false;
  noOfPersons!: any
  totalPrice!: any
  fromDate!: any
  toDate!: any
  subItems!: any
  isLoading: boolean = false;


  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ngZone: NgZone, private toastr: ToastrService,
  ) { }

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
    console.log('this.advance', this.advance)
    console.log('this.packageName', this.packageName)
    console.log('this.packageId', this.packageId)
    console.log('this.noOfPersons', this.noOfPersons)
    console.log('this.totalPrice', this.totalPrice)
    console.log('this.fromDate', this.fromDate)
    console.log('this.toDate', this.toDate)
    console.log('this.subItems', this.subItems)
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

    this.isLoading=true
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');
    this.isLoading=false

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
    this.isLoading=true

    this.http.post('https://3d2b-154-192-75-18.ngrok-free.app/payment/create-payment-intent', {
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
          this.isLoading=false
          this.toastr.error('Payment failed: ' + result.error.message, '', {
            timeOut: 7000
          });
        } else if (result?.paymentIntent?.status === 'succeeded') {
          this.isLoading=false

          this.toastr.success('Payment successful!');
        } else {
          this.isLoading=false

          this.toastr.error('Payment could not be completed', '', {
            timeOut: 7000
          });

        }
      },
      error: (error) => {
          this.isLoading=false

        this.toastr.error('Payment could not be completed', '', {
            timeOut: 7000
          });
        console.error('Error creating payment intent:', error);
      }
    });
  }
}
