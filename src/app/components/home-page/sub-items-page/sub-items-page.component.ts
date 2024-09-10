import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ItemsService } from 'src/app/items.service';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-sub-items-page',
  templateUrl: './sub-items-page.component.html',
  styleUrls: ['./sub-items-page.component.scss'],
})
export class SubItemsPageComponent {
  showModal: boolean = false;
  formData = { name: '', price: '', itemName: '', isAvailable: false };
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  subItem: any;
  subItems: any;
  showUpdateModal: boolean = false;
  subitemId: any;
  addSubItemForm: FormGroup;
  isLoading: boolean = false;
  pageCountArray: any[] = [];
  pageNumber: number = 1;
  totalPages: number = 1;
  ListAllItems: any[] = [];
  selectedItem: any;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;
  constructor(
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private itemService: ItemsService
  ) {
    this.addSubItemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      isAvailable: [true],
      item: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    const localStoragePage = localStorage.getItem('pageNumber');
    this.pageNumber = localStoragePage ? parseInt(localStoragePage) : 1;
    this.subitemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    console.log(this.subitemId, 'this is Item Id ........');
    this.getAllItems();
    this.getPaginatedSubItems(this.pageNumber);

    this.subItem = {
      name: this.addSubItemForm.value.name,
      price: this.addSubItemForm.value.price,
      isAvailable: this.addSubItemForm.value.isAvailable,
      item: this.addSubItemForm.value.item,
    };


    this.pagesCount();
  }





  openModal() {
    this.showModal = true;
    this.addSubItemForm.reset();
  }
  openUpdateModal(subItem: any) {
    this.subItem = { ...subItem };
    this.showUpdateModal = true;
    this.addSubItemForm.patchValue({
      name: this.subItem.name,
      price: this.subItem.price,
      isAvailable: this.subItem.isAvailable,
      item: this.subItem.item.id  // Ensure this is the ID
    });

    console.log(subItem)
  }


  closeModal() {
    this.showModal = false;
  }
  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  onSubmit() {
    this.closeModal();
  }

  addSubItem() {
    this.isLoading = true;
    const newItem = {
      name: this.addSubItemForm.value.name,
      price: this.addSubItemForm.value.price,
      isAvailable: this.addSubItemForm.value.isAvailable,
      item: this.addSubItemForm.value.item,
    };
    console.log(newItem, 'this is formValue to send data');
    this.subItemService.addSubItem(newItem).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.addSubItemForm.reset();
        this.getAllSubItems();
        this.getPaginatedSubItems(this.pageNumber);
        this.toastr.success('SubItem added successfully!');
        console.log(response);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.log(error);
        this.toastr.error('Error Adding Item!');
      },
    });
  }

  getAllSubItems() {
    this.subItemService.getAllSubItems().subscribe((response: any) => {
      //  this.subItems=response.allItems
      // console.log(this.subItems,'this is a list of items');
    });
  }

  getPaginatedSubItems(page: number) {
    this.isLoading = true;
    this.pageNumber = page;
    localStorage.setItem('pageNumber', this.pageNumber.toString());
    this.subItemService
      .getPaginatedSubItems(this.pageNumber)
      .subscribe((response) => {
        this.isLoading = false;
        this.subItems = response;
        this.totalPages = response.totalPages;
        this.pagesCount();
        console.log(
          this.totalPages,
          'these are peginated sub items total pages'
        );
        console.log(this.subItems, 'these are peginated sub items');

        console.log(response);
      });
  }

  deleteSubItem(itemId: number) {
    this.itemToDelete = itemId;
    this.showConfirmation = true;
  }

  handleConfirmation(confirm: boolean) {
    if (confirm && this.itemToDelete !== null) {
      this.subItemService.deleteSubItem(this.itemToDelete).subscribe(
        (response) => {
          this.toastr.success('Item deleted successfully!');
          this.itemToDelete = null;
          this.showConfirmation = false; // Close the modal
          this.getAllItems();
          this.getPaginatedSubItems(this.pageNumber);
        },
        (error) => {
          this.toastr.error('Error deleting item!');
        }
      );
    } else {
      this.showConfirmation = false; // Close the modal
    }
  }

  updateSubItem() {
    this.isLoading = true;
    const updatedItem = {
      name: this.addSubItemForm.value.name,
      price:this.addSubItemForm.value.price,
      isAvailable: this.addSubItemForm.value.isAvailable,
      item: this.addSubItemForm.value.item, // Ensure this is an ID
    };
    this.subItemService
      .updateSubItem(this.subItem._id, updatedItem)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.addSubItemForm.reset();
          this.closeUpdateModal();
          this.getAllSubItems();
          this.getPaginatedSubItems(this.pageNumber);
          this.toastr.info('SubItem updated successfully!');
        },
        error: (response: any) => {
          this.isLoading = false;
          this.toastr.error('Error Updating SubItem!');
          console.log(response);
        },
      });
  }
  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.getPaginatedSubItems(this.pageNumber);
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.getPaginatedSubItems(this.pageNumber);
    }
  }
  pagesCount() {
    this.pageCountArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageCountArray.push(i);
    }
    console.log(this.pageCountArray, 'these are the page numbers Array');
  }
  getAllItems() {
    this.itemService.getAllItems().subscribe((response: any) => {
      this.ListAllItems = response.items;
      console.log(this.ListAllItems, 'this is a list of  All items');
    });
  }
  selectItem(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    const selectedItem = this.ListAllItems.find(
      (pkg: any) => pkg._id === selectedId
    );
    console.log(selectedItem, 'selecthhh');
    if (selectedItem) {
      this.selectedItem = selectedItem;
      this.addSubItemForm.patchValue({ items: selectedItem._id });
    }
  }
}
