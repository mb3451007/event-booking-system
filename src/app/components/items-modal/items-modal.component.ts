import { Component, Input, SimpleChanges, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-items-modal',
  templateUrl: './items-modal.component.html',
  styleUrls: ['./items-modal.component.scss']
})
export class ItemsModalComponent {
  @Input() packageDetails!: any;
  isLoading: boolean = false;

  subTotals: { [subItemId: number]: number } = {};

  constructor(public activeModal: NgbActiveModal,
    private subItemService: SubItemsService,
    private router: Router)
    {
    }

  //   ngOnInit(): void {
  //     if (this.packageDetails) {
  //       this.initializeQuantities();
  //     }
  //   }

  //   initializeQuantities(): void {
  //     this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
  //       item.subItems?.forEach((subItem: any) => {
  //         this.subTotals[subItem.id] = 0; // Default quantity is 0
  //       });
  //     });

  //     console.log('subTotals', this.subTotals)
  //   }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  // dummy(){
  //   console.log('packageDetails', this.packageDetails)
  //   console.log('subt', this.subTotals)
  // }

  // getMediaURl(url: string) {
  //   const mediaUrl = this.subItemService.getMedia(url);
  //   return mediaUrl.includes('null') ? '' : mediaUrl;
  // }

  // calculateSubtotal(id: any, price:number, event: Event) {
  //   const inputElement = event.target as HTMLInputElement;

  //   // Extract and parse the value, defaulting to 0 if invalid
  //   const quantity = parseInt(inputElement.value, 10) || 0;

  //   const subtotal = quantity * price;

  //   this.subTotals[id] = subtotal;

  //   console.log('subtotal', this.subTotals[id])
  //   // console.log('subtotal', subtotal)
  // }

  // getSubTotal(id: any) {
  //   if (this.subTotals[id] == null) {
  //     return '€0.00';
  //   }

  //   // Ensure the subtotal is a number before applying toFixed
  //   const formattedSubtotal = (+this.subTotals[id]).toFixed(2);
  //   return `€${formattedSubtotal}`;
  // }


  // getTotal(): string {
  //   // Calculate the sum of all the subtotals in the subTotals object
  //   const total = Object.values(this.subTotals).reduce((sum, subtotal) => sum + (subtotal || 0), 0);

  //   // Format the total to 2 decimal places
  //   const formattedTotal = total.toFixed(2);

  //   // Return the total formatted as a currency
  //   return `€${formattedTotal}`;
  // }



  preCheckoutPage() {
    this.closeModal()
    this.router.navigate(['/pre-checkout'], { queryParams: { packageData: JSON.stringify(this.packageDetails) } })
  }


}
