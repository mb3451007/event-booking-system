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

  closeModal() {
    this.activeModal.close('Modal Closed');
  }


  preCheckoutPage() {
    this.closeModal()
    this.router.navigate(['/pre-checkout'], { queryParams: { packageData: JSON.stringify(this.packageDetails) } })
  }


}
