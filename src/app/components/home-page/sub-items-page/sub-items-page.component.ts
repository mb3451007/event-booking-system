import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
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
export class SubItemsPageComponent {
  selectedFile: File | null = null;
  showModal: boolean = false;
  formData = { name: '', price: '', itemName: '', isAvailable: true };
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
  selectedImageURl: any = null;
  selectedLocalFile: any = null;

  constructor(
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private itemService: ItemsService,
    private sanitizer: DomSanitizer
  ) {
    this.addSubItemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      isAvailable: [],
      item: ['', Validators.required],
      image: [''],
    });
  }

  ngOnInit(): void {
    this.subitemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    console.log(this.subitemId, 'this is Item Id ........');
    this.getAllItems();
    this.getPaginatedSubItems(this.pageNumber);

    this.subItem = {
      name: this.addSubItemForm.value.name,
      price: this.addSubItemForm.value.price,
      isAvailable: this.addSubItemForm.value.isAvailable,
      item: this.addSubItemForm.value.item,
      image: this.addSubItemForm.value.image,
    };

    this.pagesCount();
  }

  openModal() {
    this.selectedLocalFile = null;
    this.addSubItemForm.reset();
    this.showModal = true;
  }
  openUpdateModal(subItem: any) {
    this.addSubItemForm.reset();
    this.subItem = { ...subItem };
    console.log(subItem);
    this.selectedImageURl = subItem.imageUrl;
    this.selectedLocalFile = null;
    console.log(this.selectedImageURl);
    this.showUpdateModal = true;
    this.addSubItemForm.patchValue({
      name: this.subItem.name,
      price: this.subItem.price,
      isAvailable: this.subItem.isAvailable,
      item: this.subItem.item.id, // Ensure this is the ID
    });

    console.log(subItem);
  }

  closeModal() {
    this.showModal = false;
    this.addSubItemForm.reset();
  }
  closeUpdateModal() {
    this.showUpdateModal = false;
    this.addSubItemForm.reset();
  }

  onSubmit() {
    this.closeModal();
  }

  // addSubItem() {
  //   this.isLoading = true;
  //   const newItem = {
  //     name: this.addSubItemForm.value.name,
  //     price: this.addSubItemForm.value.price,
  //     isAvailable: this.addSubItemForm.value.isAvailable,
  //     item: this.addSubItemForm.value.item,
  //     image: this.addSubItemForm.value.image,
  //   };

  //   console.log(newItem, 'this is formValue to send data');
  //   this.subItemService.addSubItem(newItem).subscribe({
  //     next: (response: any) => {
  //       this.isLoading = false;
  //       this.addSubItemForm.reset();
  //       this.getAllSubItems();
  //       this.getPaginatedSubItems(this.pageNumber);
  //       this.toastr.success('SubItem added successfully!');
  //       console.log(response);
  //     },
  //     error: (error: any) => {
  //       this.isLoading = false;
  //       console.log(error);
  //       this.toastr.error('Error Adding Item!');
  //     },
  //   });
  // }

  addSubItem() {
    this.isLoading = true;
    const formData = new FormData();

    // Append form fields
    formData.append('name', this.addSubItemForm.value.name);
    formData.append('price', this.addSubItemForm.value.price);
    formData.append('isAvailable', this.addSubItemForm.value.isAvailable);
    formData.append('item', this.addSubItemForm.value.item);

    // Append the file if available
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Call the service to upload the data
    this.subItemService.addSubItem(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.addSubItemForm.reset();

        this.getAllSubItems();
        this.getPaginatedSubItems(this.pageNumber);
        this.selectedImageURl = null;
        this.toastr.success('SubItem added successfully!');
      },
      error: (error: any) => {
        this.isLoading = false;
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
    const formData = new FormData();

    // Append the fields to be updated
    formData.append('name', this.addSubItemForm.value.name);
    formData.append('price', this.addSubItemForm.value.price);
    formData.append('isAvailable', this.addSubItemForm.value.isAvailable);
    formData.append('item', this.addSubItemForm.value.item); // Ensure this is an ID

    // Append the new file if selected, otherwise send the existing image ID or URL
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      // If no new file is selected, you might want to send the existing image ID or URL
      formData.append('existingImage', this.subItem.imageUrl); // Adjust as per your backend requirement
    }

    // Call the service to update the data
    this.subItemService.updateSubItem(this.subItem._id, formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.addSubItemForm.reset();
        this.closeUpdateModal();
        this.getAllSubItems();
        this.getPaginatedSubItems(this.pageNumber);
        this.selectedImageURl = null;
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
  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
      this.closeUpdateModal();
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedLocalFile = reader.result;
      };
      reader.readAsDataURL(file);
    }
    this.addSubItemForm.markAsDirty();
  }

  getMediaURl(url: string) {
    const mediaUrl = this.subItemService.getMedia(url);
    return mediaUrl.includes('undefined') ? '' : mediaUrl;
  }
}
