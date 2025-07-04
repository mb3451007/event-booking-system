import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { map, Observable, startWith } from 'rxjs';
import { ItemsService } from 'src/app/items.service';
import { SubItemsService } from 'src/app/sub-items.service';
import { PackagesService } from 'src/app/packages.service';

@Component({
  selector: 'app-peckages',
  templateUrl: './peckages.component.html',
  styleUrls: ['./peckages.component.scss'],
  animations: [
    trigger('modalAnimation', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.7)',
        })
      ),
      state(
        '*',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      transition('void => *', [animate('300ms ease-in')]),
      transition('* => void', [animate('300ms ease-out')]),
    ]),
  ],
})
export class PeckagesComponent {
  currentPage = 1;
  pagination: number[] = [];
  showSubItems: boolean = false;
  ListItems: any = [];
  ListAllItems: any = [];
  pListItems: any = [];
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  formData = { name: '', price: '', isAvailable: false };
  items: Array<{ name: string; price: string; isAvailable: boolean }> = [];
  itemId: any;
  addItemForm: FormGroup;
  filterItemArray: any[] = [];
  pageCountArray: any[] = [];
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  item: any;

  filterError: boolean = false;

  pageNumber: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  selectedPackage: any = null;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;

  constructor(
    private peckageService: PackagesService,
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      minPersons: ['', Validators.required],
      maxPersons: ['', Validators.required],
      description: ['', Validators.required],
      finalNotes: ['', Validators.required],
      discount: [false],
      discountPercentage: [''],
      discountName: [''],
    });
  }

  ngOnInit(): void {
    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);
    this,this.updatePagination()
    this.pagesCount();

    this.item = {
      name: this.addItemForm.value.name,
      price: this.addItemForm.value.price,
      minPersons: this.addItemForm.value.minPersons,
      maxPersons: this.addItemForm.value.maxPersons,
      description: this.addItemForm.value.description,
      finalNotes: this.addItemForm.value.finalNotes,
      discount: this.addItemForm.value.discount,
      discountPercentage: this.addItemForm.value.discountPercentage,
      discountName: this.addItemForm.value.discountName,
    };
  }

  openModal() {
    this.addItemForm.reset();
    this.showModal = true;
    setTimeout(() => {
      document.querySelector('.modal.show')?.classList.add('show');
    }, 10);
  }

  openUpdateModal(item: any) {
    this.addItemForm.reset();
    this.item = { ...item };
    this.addItemForm.patchValue({
      name: this.item.name,
      price: this.item.price,
      minPersons: this.item.minPersons,
      maxPersons: this.item.maxPersons,
      description: this.item.description,
      finalNotes: this.item.finalNotes,
      discount: this.item.discount,
      discountPercentage: this.item.discountPercentage,
      discountName: this.item.discountName,
    });
    this.showUpdateModal = true;
    setTimeout(() => {
      document.querySelector('.modal.show')?.classList.add('show');
    }, 10);
  }

  closeModal() {
    document.querySelector('.modal.show')?.classList.remove('show');
    setTimeout(() => {
      this.showModal = false;
    }, 300);
    // this.addItemForm.reset();
  }
  closeUpdateModal() {
    document.querySelector('.modal.show')?.classList.remove('show');
    setTimeout(() => {
      this.showUpdateModal = false;
    }, 300);
  }

  onSubmit() {
    this.closeModal();
  }

  addItem() {
    this.isLoading = true;
    if (this.addItemForm.valid) {
      const newItem = {
        name: this.addItemForm.value.name,
        price: this.addItemForm.value.price,
        minPersons: this.addItemForm.value.minPersons,
        maxPersons: this.addItemForm.value.maxPersons,
        description: this.addItemForm.value.description,
        finalNotes: this.addItemForm.value.finalNotes,
        discount: this.addItemForm.value.discount,
        discountPercentage: this.addItemForm.value.discountPercentage,
        discountName: this.addItemForm.value.discountName,
      };
      console.log(newItem, 'data to add in package');
      this.peckageService.addPeckage(newItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.toastr.success('Package added successfully!');
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.addItemForm.reset();
          this.addItemForm.markAsPristine();
          console.log(response);
          this.closeModal();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Error Adding Package.');
          console.log(err);
        },
      });
    } else {
      this.addItemForm.markAllAsTouched();
    }
  }

  getAllItems() {
    this.peckageService.getAllPeckage().subscribe((response: any) => {
      this.ListAllItems = response.items;
      console.log(response, 'this is a list of  All packages');
    });
  }
  getPaginatedItems(page: number) {
    this.isLoading = true;
    this.pageNumber = page;
    this.peckageService
      .getPaginatedPeckage(this.pageNumber)
      .subscribe((response: any) => {
        this.isLoading = false;
        this.ListItems = response.items;
        this.totalPages = response.totalPages;
        this.updatePagination()
        this.pagesCount();
        console.log(response, 'these are paginated packages');
        if(this.pageNumber>response.totalPages){
          this.getPaginatedItems(this.pageNumber-1);
        }
      });
  }

  deleteItem(itemId: number) {
    this.itemToDelete = itemId;
    this.showConfirmation = true;
  }
  handleConfirmation(confirm: boolean) {
    if (confirm && this.itemToDelete !== null) {
      this.peckageService.deletePeckage(this.itemToDelete).subscribe(
        (response) => {
          this.toastr.success('Item deleted successfully!');
          this.itemToDelete = null;
          this.showConfirmation = false; // Close the modal
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
        },
        (error) => {
          this.toastr.error('Error deleting item!');
        }
      );
    } else {
      this.showConfirmation = false; // Close the modal
    }
  }

  updateItem() {
    this.isLoading = true;
    if (this.addItemForm.dirty) {
      const updatedItem = {
        ...this.item,
        name: this.addItemForm.value.name,
        price: this.addItemForm.value.price,
        minPersons: this.addItemForm.value.minPersons,
        maxPersons: this.addItemForm.value.maxPersons,
        description: this.addItemForm.value.description,
        finalNotes: this.addItemForm.value.finalNotes,
        discount: this.addItemForm.value.discount,
        discountPercentage: this.addItemForm.value.discountPercentage,
        discountName: this.addItemForm.value.discountName,
      };
      this.peckageService.updatePeckage(this.item._id, updatedItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log(response);
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.toastr.info('Package updated successfully!');
          this.addItemForm.markAsPristine();
          this.addItemForm.reset();
          this.closeUpdateModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Error Updating Package.');
          console.log(error);
        },
      });
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.getPaginatedItems(this.pageNumber);
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.getPaginatedItems(this.pageNumber);
    }
  }
  pagesCount() {
    this.pageCountArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageCountArray.push(i);
    }
    console.log(this.pageCountArray, 'these are the page numbers Array');
  }

  filterErrorShow() {
    this.filterError = true;
  }

  viewItem(itemId: number) {
    console.log(itemId, 'this is item id for details');
    this.router.navigate(['package-detail/', itemId]);
  }

  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
      this.closeUpdateModal();
    }
  }
  toggleDiscount() {
    const discountChecked = this.addItemForm.get('discount')?.value;
  }

  previewUpdatedChanges() {
    const navigationExtras: NavigationExtras = {
      state: {
        name: this.addItemForm.value.name,
        price: this.addItemForm.value.price,
        minPersons: this.addItemForm.value.minPersons,
        maxPersons: this.addItemForm.value.maxPersons,
        description: this.addItemForm.value.description,
        finalNotes: this.addItemForm.value.finalNotes,
        discount: this.addItemForm.value.discount,
        discountPercentage: this.addItemForm.value.discountPercentage,
        discountName: this.addItemForm.value.discountName,
        isAvailable: true,
      },
    };
    console.log('Navigating with extras:', navigationExtras);
    this.router.navigate(['package-detail/', this.item._id], navigationExtras);
  }
  onPageChange(page: number): void {
    console.log('Page changed to:'+ page);
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageNumber = page;
    this.updatePagination();
    this.getPaginatedItems(this.pageNumber)
  }

  updatePagination(): void {
    this.pagination = this.getPagination(this.currentPage, this.totalPages);
  }

  getPagination(currentPage: number, totalPages: number): number[] {
    const visiblePages = 9;
    const pagination: number[] = [];

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      pagination.push(1);

      if (currentPage > 5) pagination.push(-1);

      const startPage = Math.max(2, currentPage - 3);
      const endPage = Math.min(totalPages - 1, currentPage + 3);

      for (let i = startPage; i <= endPage; i++) {
        pagination.push(i);
      }

      if (currentPage < totalPages - 4) pagination.push(-1);

      pagination.push(totalPages);
    }

    return pagination;
  }

}
