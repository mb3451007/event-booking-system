import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
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
  total= 0;
  packageName: string = '';
  checkoutPrice = 0;
  infoForm!: FormGroup;
  cardValid: boolean = false; // Track card validity

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // this.checkoutPrice = parseFloat(this.total);

    this.route.queryParams.subscribe(params => {
      this.total = Number(params['amount']);;
      this.packageName = params['packageName'];
    });
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
      if (event.error) {
        displayError!.textContent = event.error.message;
        this.cardValid = false;
      } else {
        displayError!.textContent = '';
        this.cardValid = event.complete; // `complete` is true when card input is valid
      }
    });
  }

  async onCheckout(): Promise<void> {
    // if (!this.stripe || !this.cardValid || this.infoForm.invalid) {

    //   alert('Please fill in all required details and provide valid card information.');
    //   return;
    // }
    console.log(this.infoForm.value)

    this.http.post('http://localhost:3000/payment/create-payment-intent', {
      amount: this.total * 100,
      currency: 'eur',
      userId: '676ebd9caa6ea87633c515c9'
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
