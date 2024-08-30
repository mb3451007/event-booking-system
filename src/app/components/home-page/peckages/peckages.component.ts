
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { ToastrService } from 'ngx-toastr';

import { map, Observable, startWith } from 'rxjs';
import { ItemsService } from 'src/app/items.service';
import { SubItemsService } from 'src/app/sub-items.service';
import { PackagesService } from '../packages.service';

@Component({
  selector: 'app-peckages',
  templateUrl: './peckages.component.html',
  styleUrls: ['./peckages.component.scss']
})
export class PeckagesComponent {
  autoSearchTerm: string = '';
  autoitems: string[] = [];
  filteredItems: string[] = [];
  showSubItems:boolean=false
  ListItems: any = [];
  ListAllItems: any = [];
  pListItems: any = [];
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  formData = { name: '', price: '', isAvailable: false };
  items: Array<{ name: string; price: string; isAvailable: boolean }> = [];
  itemId: any;
  addItemForm: FormGroup;
  filterItemArray:any[]=[]
  pageCountArray:any[]=[]
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  item: any;
  showSubItemsSearch: boolean = false;
  filterForm:FormGroup
  subItems :any = []
  searchTerm: string = '';
  selectedSubItems: any[] = [];
  subItemsSearch: any ;
  filterError:boolean=false;
  
  filteredSubItems:any[] = [];
  pageNumber:number =1
  totalPages:number =1
  isLoading : boolean = false;
  constructor(
    private peckageService: PackagesService,
    private subItemService: SubItemsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      isAvailable: [true],
      subItems: this.selectedSubItems.map(item => item._id),
      subItemsSearch: ['']
    });
    this.filterForm = this.fb.group({
      filtername: ['', Validators.required],
      filterprice: ['', Validators.required],
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
    const localStoragePage=localStorage.getItem('pageNumber')
    this.pageNumber=localStoragePage? parseInt(localStoragePage):1;
    this.addItemForm.get('subItemsSearch')?.valueChanges.subscribe(() => {
      this.filterSubItems();
    });
    this.filteredSubItems = this.subItems;
    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);
    this.getAllSubItems()
    this.pagesCount()

    this.item = {
      name: this.addItemForm.value.name,
      isAvailable: this.addItemForm.value.isAvailable,
      subItems:this.selectedSubItems.map(item => item._id),
    };
  }

 

  openModal() {
    this.showModal = true;
    this.resetFilteredSubItems()
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
    this.isLoading =true;
    if (this.addItemForm.valid) {
      const newItem = {
        name: this.addItemForm.value.name,
        isAvailable: this.addItemForm.value.isAvailable,
        subItems: this.selectedSubItems.map(item => item._id)
      };
      console.log(this.addItemForm.value, 'this is formValue to send data');
      this.peckageService.addPeckage(newItem).subscribe({
      next:(response:any)=>{
        this.isLoading=false;
        this.toastr.success('Package added successfully!');
        this.getAllItems();
        this.getPaginatedItems(this.pageNumber);
        this.addItemForm.reset();
        this.resetFilteredSubItems();
        // this.filteredSubItems = this.subItems;
        this.getAllSubItems()
        this.addItemForm.markAsPristine();
        this.selectedSubItems = [];
        console.log(response);
        this.closeModal();
      },
      error:(err)=>{
      this.isLoading=false;
      this.toastr.error('Error Adding Package.');
      console.log(err)
      }
      })
    } else {
      this.addItemForm.markAllAsTouched(); 
    }
  }

  getAllItems() {
    this.peckageService.getAllPeckage().subscribe((response: any) => {
      this.ListAllItems=response.items
      console.log(this.ListAllItems, 'this is a list of  All items');
    });
  }
 
  getPaginatedItems(page: number) {
    this.isLoading=true
    this.pageNumber=page
    localStorage.setItem('pageNumber',this.pageNumber.toString())
    this.peckageService.getPaginatedPeckage(this.pageNumber).subscribe((response:any) => {
      this.isLoading=false
      this.ListItems = response.items;
      this.totalPages= response.totalPages
      this.pagesCount();
      console.log(this.pageNumber, 'this is  PageNumber');
      console.log(response, 'these are paginated items');
    });
  }

  deleteItem(itemId: number) {
    console.log(itemId);
    this.peckageService.deletePeckage(itemId).subscribe((response) => {
      console.log(response);
      this.getAllItems();
      this.getPaginatedItems(this.pageNumber);
      this.toastr.error('Package deleted successfully!');
    });
  }

  updateItem() {
    this.isLoading=true
    if (this.addItemForm.dirty) {
      const updatedItem ={
        ...this.item,
        subItems: this.selectedSubItems.map(item => item._id)

      }
      this.peckageService.updatePeckage(this.item._id, updatedItem).subscribe({
        next: (response:any) =>{
          this.isLoading=false
          console.log(response);
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber)
          this.toastr.info('Package updated successfully!');
          this.addItemForm.markAsPristine();
          this.addItemForm.reset();
          this.closeUpdateModal();
        },
        error: (error) =>{
          this.isLoading=false
          this.toastr.error('Error Updating Package.');
          console.log(error);
        }
      })
     
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
    this.isLoading=true
    this.subItemService.getAllSubItems().subscribe((response:any) => {
      this.isLoading=false
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
  pagesCount(){
    this.pageCountArray = [];
    for(let i=1; i<=this.totalPages; i++){
      this.pageCountArray.push(i)
    }
    console.log(this.pageCountArray, 'these are the page numbers Array');
  }
  filterIem(){
    const filterName= this.filterForm.value.filtername.toLowerCase() || '';
    this.filterItemArray=this.ListAllItems.filter((item:any)=>{
      const matchesName=item.name.toLowerCase().includes(filterName);
      this.filterErrorShow()
      return matchesName
    });
    if(this.filterItemArray.length==0){
      this.toastr.warning('No Package match your filter criteria.');
    }
    console.log(this.filterItemArray, 'filterItemArray Items ######');
    
  }
  filterErrorShow(){
    this.filterError=true;
  }
  resetFilteredSubItems() {
    this.filteredSubItems = [...this.subItems];
  }
 
  
}
