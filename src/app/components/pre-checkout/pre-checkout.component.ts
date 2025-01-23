import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-pre-checkout',
  templateUrl: './pre-checkout.component.html',
  styleUrls: ['./pre-checkout.component.scss']
})
export class PreCheckoutComponent {
  packageDetails: any;
  isLoading: boolean = false;

  subTotals: { [subItemId: number]: number } = {};

  constructor(private route: ActivatedRoute,
    private subItemService: SubItemsService,
    private router: Router) { }

  ngOnInit(): void {
    // Retrieve the queryParams
    this.route.queryParams.subscribe(params => {
      const packageData = params['packageData']; // Get the 'packageData' query param
      if (packageData) {
        this.packageDetails = JSON.parse(packageData); // Parse the JSON string into an object
      }
    });

    console.log('checkout packageDetails', this.packageDetails)
    if (this.packageDetails) {
      this.initializeQuantities();
    }
  }

  initializeQuantities(): void {
    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      item.subItems?.forEach((subItem: any) => {
        this.subTotals[subItem._id] = subItem.price; // Initialize with the price of each subItem
      });
    });

    console.log('subTotals', this.subTotals);
  }

  getMediaURl(url: string) {
    const mediaUrl = this.subItemService.getMedia(url);
    return mediaUrl.includes('null') ? '' : mediaUrl;
  }

  calculateSubtotal(id: any, price: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;

    // Extract and parse the value, defaulting to 0 if invalid
    const quantity = parseInt(inputElement.value, 10) || 0;

    const subtotal = quantity * price;

    this.subTotals[id] = subtotal;

    console.log('subtotal', this.subTotals[id])
    // console.log('subtotal', subtotal)
  }

  getSubTotal(id: any) {
    if (this.subTotals[id] == null) {
      return '€0.00';
    }

    // Ensure the subtotal is a number before applying toFixed
    const formattedSubtotal = (+this.subTotals[id]).toFixed(2);
    return `€${formattedSubtotal}`;
  }


  getTotal(): string {
    // Calculate the sum of all the subtotals in the subTotals object
    const total = Object.values(this.subTotals).reduce((sum, subtotal) => sum + (subtotal || 0), 0);

    // Format the total to 2 decimal places
    const formattedTotal = total.toFixed(2);

    // Return the total formatted as a currency
    return `€${formattedTotal}`;
  }


  preCheckoutPage() {
    const totalAmount = this.getTotal(); // Get the total
    const fortyPercent = (parseFloat(totalAmount.replace('€', '')) * 0.4).toFixed(2); // Calculate 40%

    const packageName = this.packageDetails?.package?.name || ''; // Get the package name from packageDetails

    // Navigate to the checkout page with query parameters
    this.router.navigate(['/checkout'], {
      queryParams: {
        amount: fortyPercent,
        packageName: packageName
      }
    });
  }

}
