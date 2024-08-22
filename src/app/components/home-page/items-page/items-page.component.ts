import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ItemsService } from 'src/app/items.service';
import { SubItemsService } from 'src/app/sub-items.service';
@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  styleUrls: ['./items-page.component.scss'],
})
export class ItemsPageComponent implements OnInit {
  autoSearchTerm: string = '';
  autoitems: string[] = ['Mohsin', 'Zeeshan', 'Hameed'];
  filteredItems: string[] = [];
  showSubItems:boolean=false
  ListItems: any = [];
  pListItems: any = [];
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  formData = { name: '', price: '', isAvailable: false };
  items: Array<{ name: string; price: string; isAvailable: boolean }> = [];
  itemId: any;
  addItemForm: FormGroup;
  
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  item: any;
  showSubItemsSearch: boolean = false;

  subItems :any = []
  searchTerm: string = '';
  selectedSubItems: any[] = [];
  subItemsSearch: any ;
  
  filteredSubItems:any[] = [];
 
  pageNumber:number =1
  totalPages:number =10
  constructor(
    private itemService: ItemsService,
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      isAvailable: ['', Validators.required],
      subItems: this.selectedSubItems.map(item => item._id),
      subItemsSearch: ['']
    });
  }
  onInput() {
 console.log('this search:',this.subItemsSearch)
    this.filteredSubItems = [...this.subItems]; 
    this.filteredItems = this.autoitems.filter(autoitems =>
      autoitems.toLowerCase().includes(this.subItemsSearch.toLowerCase())
    );

  }
  selectItem(autoitems: string) {
    this.autoSearchTerm = autoitems;
    this.filteredItems = [];
  }
  ngOnInit(): void {
 

    this.addItemForm.get('subItemsSearch')?.valueChanges.subscribe(() => {
      this.filterSubItems();
    });
    this.filteredSubItems = this.subItems;
    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);
    this.getAllSubItems()

    this.item = {
      name: this.addItemForm.value.name,
      price: this.addItemForm.value.price,
      isAvailable: this.addItemForm.value.isAvailable,
      subItems:this.selectedSubItems.map(item => item._id),
    };
  }

 

  openModal() {
    this.showModal = true;
  }

  openUpdateModal(item: any) {
    this.item = { ...item };
    this.selectedSubItems = this.subItems.filter((subItem:any) =>
      item.subItems.includes(subItem._id)
    );
  
    this.filteredSubItems = this.subItems.filter((subItem:any) => 
      !this.selectedSubItems.some(selectedItem => selectedItem._id === subItem._id)
    );
  console.log(this.filteredSubItems,'this is filtered subItems')
    this.addItemForm.patchValue({
      name: this.item.name,
      price: this.item.price,
      isAvailable: this.item.isAvailable,
      subItems: this.selectedSubItems.map(subItem => subItem._id)
    });
  
    this.showUpdateModal = true;
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

  addItem() {
    if (this.addItemForm.valid) {
      const newItem = {
        name: this.addItemForm.value.name,
        price: this.addItemForm.value.price,
        isAvailable: this.addItemForm.value.isAvailable,
        subItems: this.selectedSubItems.map(item => item._id)
      };
      console.log(this.addItemForm.value, 'this is formValue to send data');
      this.itemService.addItem(newItem).subscribe((response) => {
        this.getAllItems();
        this.getPaginatedItems(1);
        this.addItemForm.reset();
        this.addItemForm.markAsPristine();
        this.selectedSubItems = [];
        console.log(response);
        this.closeModal();
      });
    } else {
      this.addItemForm.markAllAsTouched(); 
    }
  }

  getAllItems() {
    this.itemService.getAllItems().subscribe((response: any) => {
      // this.ListItems=response.items
      console.log(response, 'this is a list of  All items');
    });
  }

  getPaginatedItems(pageNumber: number) {
    this.itemService.getPaginatedItems(pageNumber).subscribe((response:any) => {
      this.ListItems = response.items;
      this.totalPages= response.totalPages
      console.log(this.totalPages, 'these are total Pages');
      console.log(this.pageNumber, 'this is  PageNumber');
      console.log(response, 'these are paginated items');
    });
  }

  deleteItem(itemId: number) {
    console.log(itemId);
    this.itemService.deleteItem(itemId).subscribe((response) => {
      console.log(response);
      this.getAllItems();
      this.getPaginatedItems(1);
    });
  }

  updateItem() {
    if (this.addItemForm.dirty) {
      const updatedItem ={
        ...this.item,
        subItems: this.selectedSubItems.map(item => item._id)

      }
      this.itemService.updateItem(this.item._id, updatedItem).subscribe((response) => {
          console.log(response);
          this.getAllItems();
          this.addItemForm.markAsPristine();
          this.addItemForm.reset();
          this.closeUpdateModal();
        });
    }
  }

  onSelectSubItem(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    
    const subItem = this.filteredSubItems.find(item => item._id === value);
    
    if (subItem) {
      this.selectedSubItems.push(subItem);
      this.filteredSubItems = this.filteredSubItems.filter(item => item._id !== subItem._id);
      
      this.addItemForm.patchValue({ subItems: this.selectedSubItems.map(item => item._id) });
    }
  }
  
  removeSubItem(subItem: any) {
    this.selectedSubItems = this.selectedSubItems.filter(item => item._id !== subItem._id);
    this.subItems.push(subItem);
    this.filteredSubItems.push(subItem);

    this.addItemForm.patchValue({ subItems: this.selectedSubItems.map(item => item._id) });
  }

  filterSubItems() {
    const searchTerm = this.addItemForm.get('subItemsSearch')?.value.toLowerCase();
    if (searchTerm) {
      this.filteredSubItems = this.subItems.filter((subItem:any) =>
        subItem.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredSubItems = [...this.subItems];
    }
  }
  toggleSubItemsSearch() {
    this.showSubItemsSearch = !this.showSubItemsSearch;
  }

  selectSubItem(subItem: any) {
    this.selectedSubItems.push(subItem);
    this.subItems = this.subItems.filter((item:any) => item._id !== subItem._id);
    this.filteredSubItems = this.filteredSubItems.filter(item => item._id !== subItem._id);
    this.addItemForm.patchValue({ subItems: this.selectedSubItems.map(item => item._id) });
    this.addItemForm.get('subItemsSearch')?.setValue(''); // Clear search term
    this.showSubItems=false;
  }
  onFocusActive(){
    this.showSubItems=true
  }
 
  onBlurActive(){
    this.showSubItems=false;
  }
  getAllSubItems() {
    this.subItemService.getAllSubItems().subscribe((response:any) => {
      console.log(response,'this is subitems in items component' )
       this.subItems=response.items
        console.log(this.subItems,'this is a list of subitems assyning');
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
}
