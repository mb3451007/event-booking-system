import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormControl,FormGroup,Validators,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { ItemsService } from 'src/app/items.service';
import { SubItemsService } from 'src/app/sub-items.service';
import { PackagesService } from '../packages.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  styleUrls: ['./items-page.component.scss'],
  animations: [
    trigger('modalAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.7)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', [
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-out')
      ]),
      
    ]),
  ],
})
export class ItemsPageComponent implements OnInit {
  autoitems: string[] = [];
  autopackages: string[] = [];
  filteredItems: string[] = [];
  showPackages: boolean = false;
  ListItems: any = [];
  ListPackages: any = [];
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
  showSubItemsSearch: boolean = false;
  showpackagesSearch: boolean = false;


  packages: any;

  selectedPackage: any;

  filterError: boolean = false;

  filteredPackages: any[] = [];
  pageNumber: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;
  constructor(
    private itemService: ItemsService,
    private packageService: PackagesService,
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      isAvailable: [true],
      packages: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const localStoragePage = localStorage.getItem('pageNumber');
    this.pageNumber = localStoragePage ? parseInt(localStoragePage) : 1;

    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);

    this.getAllPackages();
    this.pagesCount();

    this.item = {
      name: this.addItemForm.value.name,
      isAvailable: this.addItemForm.value.isAvailable,
      packages: this.addItemForm.value.selectedPackage,
    };
  }


  openModal() {
    this.showModal = true;
    this.addItemForm.reset();
    this.resetFilteredPackages();
  }

  selectedID=''

  openUpdateModal(item: any) {
    this.item = { ...item };

    this.addItemForm.patchValue({
      name: this.item.name,
      isAvailable: this.item.isAvailable,
      packages: this.item.package.id  // Ensure this is the ID
    });

console.log(item)

    this.showUpdateModal = true;
  }



  closeModal() {
    this.showModal = false;
  }
  closeUpdateModal() {
    this.showUpdateModal = false;
    this.addItemForm.reset();
    this.selectedPackage = null;
  }

  onSubmit() {
    this.closeModal();
  }

  addItem() {
    this.isLoading = true;
    if (this.addItemForm.valid) {
      const newItem = {
        name: this.addItemForm.value.name,
        isAvailable: this.addItemForm.value.isAvailable,
        packages: this.addItemForm.value.packages,
      };
      console.log('formVal', this.addItemForm.value)
      console.log(newItem,'jjhjhj')
      this.itemService.addItem(newItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.toastr.success('Item added successfully!');
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.addItemForm.reset();
          this.resetFilteredPackages();
          this.getAllPackages();
          this.addItemForm.markAsPristine();
          console.log(response);
          this.closeModal();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Error Adding Item.');
          console.log(err);
        },
      });
    } else {
      this.addItemForm.markAllAsTouched();
    }
  }

  getAllItems() {
    this.itemService.getAllItems().subscribe((response: any) => {
      this.ListAllItems = response.items;
      console.log(this.ListAllItems, 'this is a list of  All items');
    });
  }

  getPaginatedItems(page: number) {
    this.isLoading = true;
    this.pageNumber = page;
    localStorage.setItem('pageNumber', this.pageNumber.toString());
    this.itemService
      .getPaginatedItems(this.pageNumber)
      .subscribe((response: any) => {
        this.isLoading = false;
        this.ListItems = response.items;
        this.ListPackages = this.ListItems.map(
          (item: any) => item.packages
        ).flat();
        this.totalPages = response.totalPages;
        this.pagesCount();

        console.log(this.pageNumber, 'this is  PageNumber');
        console.log(response.items, 'these are paginated items');
      });
  }

  deleteItem(itemId: number) {
    this.itemToDelete = itemId;
    this.showConfirmation = true;
  }

  handleConfirmation(confirm: boolean) {
    if (confirm && this.itemToDelete !== null) {
      this.itemService.deleteItem(this.itemToDelete).subscribe(
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

  viewItem(itemId: any) {}

  updateItem() {
    this.isLoading = true;
    if (this.addItemForm.dirty) {
      const updatedItem = {
        name: this.addItemForm.value.name,
        isAvailable: this.addItemForm.value.isAvailable,
        packages: this.addItemForm.value.packages, // Ensure this is an ID
      };
      console.log(updatedItem,"----------------updated item----")
      this.itemService.updateItem(this.item._id, updatedItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log(response);
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.toastr.info('Item updated successfully!');
          this.addItemForm.markAsPristine();
          this.closeUpdateModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Error Updating Item.');
          console.log(error);
        },
      });
    }
  }

  onSelectPackage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    const selectedPackage = this.filteredPackages.find(
      (pkg) => pkg._id === value
    );
  }

  filterPackages() {
    const searchPackageTerm =
      this.addItemForm.get('packageSearch')?.value?.toLowerCase() || '';
    if (searchPackageTerm) {
      this.filteredPackages = this.packages.filter((pkg: any) =>
        pkg.name.toLowerCase().includes(searchPackageTerm)
      );
    } else {
      this.filteredPackages = [...this.packages];
    }
  }

  toggleSubItemsSearch() {
    this.showSubItemsSearch = !this.showSubItemsSearch;
  }
  togglepackagesSearch() {
    this.showpackagesSearch = !this.showpackagesSearch;
  }

  onFocusActivePackages() {
    this.showPackages = true;
  }

  getAllPackages() {
    this.isLoading = true;
    this.packageService.getAllPeckage().subscribe((response: any) => {
      this.isLoading = false;
      this.packages = response.items;
      console.log(this.packages,'these are all packages')
    });
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
  }

  resetFilteredPackages() {
    this.filteredPackages = this.packages;
  }
  getPackageName(id: string): string {
    const packages = this.packages.find((pkg: any) => pkg._id === id); // Assuming allPackages contains all available packages
    return packages ? packages.name : 'Unknown Package';
  }

  selectPackage(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    const selectedPkg = this.packages.find(
      (pkg: any) => pkg._id === selectedId
    );

    if (selectedPkg) {
      this.selectedPackage = selectedPkg;
      this.addItemForm.patchValue({ selectedPackage: selectedPkg._id });
    }
  }

  removePackage(): void {
    this.selectedPackage = null;
    this.addItemForm.patchValue({ selectedPackage: null });
  }
  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
      this.closeUpdateModal();
    }
  }

}
