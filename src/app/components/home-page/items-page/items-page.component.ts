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
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  styleUrls: ['./items-page.component.scss'],
})
export class ItemsPageComponent implements OnInit {
  autoSearchTerm: string = '';
  autoitems: string[] = [];
  autopackages: string[] = [];
  filteredItems: string[] = [];
  showSubItems:boolean=false
  showPackages:boolean=false
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
  filterItemArray:any[]=[]
  pageCountArray:any[]=[]
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  item: any;
  showSubItemsSearch: boolean = false;
  showpackagesSearch: boolean = false;
  filterForm:FormGroup
  subItems :any = []
  packages :any = []
  searchTerm: string = '';
  selectedSubItems: any[] = [];
  selectedPackages: any[] = [];
  subItemsSearch: any ;
  packageSearch: any ;
  filterError:boolean=false;
  
  filteredSubItems:any[] = [];
  filteredPackages:any[] = [];
  pageNumber:number =1
  totalPages:number =1
  isLoading : boolean = false;
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
      subItems: this.selectedSubItems.map(item => item._id),
      packages: this.selectedPackages.map(item => item._id),
      subItemsSearch: [''],
      packageSearch: [''],
    });
    this.filterForm = this.fb.group({
      filtername: ['', Validators.required],
      filterprice: ['', Validators.required],
    });
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
    this.addItemForm.get('packageSearch')?.valueChanges.subscribe(() => {
      this.filterPackages();
    });
    this.filteredSubItems = this.subItems;
    this.filteredPackages = this.packages;
    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);
    this.getAllSubItems()
    this.getAllPackages()
    this.pagesCount()

    this.item = {
      name: this.addItemForm.value.name,
      isAvailable: this.addItemForm.value.isAvailable,
      subItems:this.selectedSubItems.map(item => item._id),
      packages:this.selectedPackages.map(item => item._id),
    };
  }

 

  openModal() {
    this.showModal = true;
    this.resetFilteredSubItems()
    this.resetFilteredPackages();
  }

  openUpdateModal(item: any) {
    this.item = { ...item };
    this.selectedSubItems = this.subItems.filter((subItem:any) =>
      item.subItems.includes(subItem._id)
    );
    this.selectedPackages = this.packages.filter((packages:any) =>
      item.packages.includes(packages._id)
    );
  
    this.filteredSubItems = this.subItems.filter((subItem:any) => 
      !this.selectedSubItems.some(selectedItem => selectedItem._id === subItem._id)
    );
    this.filteredPackages = this.packages.filter((packages:any) => 
      !this.selectedPackages.some(selectedPackage => selectedPackage._id === packages._id)
    );
    this.addItemForm.patchValue({
      name: this.item.name,
      isAvailable: this.item.isAvailable,
      subItems: this.selectedSubItems.map(subItem => subItem._id),
      packages: this.selectedPackages.map(packages => packages._id)
    });
  
    this.showUpdateModal = true;
  }
  


  closeModal() {
    this.showModal = false;
  }
  closeUpdateModal() {
    this.showUpdateModal = false;
    this.addItemForm.reset()
    this.selectedSubItems = [];
    this.selectedPackages=[]
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
        subItems: this.selectedSubItems.map(item => item._id),
        packages: this.selectedPackages.map(packages => packages._id)
      };
      this.itemService.addItem(newItem).subscribe({
      next:(response:any)=>{
        this.isLoading=false;
        this.toastr.success('Item added successfully!');
        this.getAllItems();
        this.getPaginatedItems(this.pageNumber);
        this.addItemForm.reset();
        this.resetFilteredSubItems();
        this.resetFilteredPackages();
        this.getAllSubItems()
        this.getAllPackages()
        this.addItemForm.markAsPristine();
        this.selectedSubItems = [];
        this.selectedPackages=[]
        console.log(response);
        this.closeModal();
      },
      error:(err)=>{
      this.isLoading=false;
      this.toastr.error('Error Adding Item.');
      console.log(err)
      }
      })
    } else {
      this.addItemForm.markAllAsTouched(); 
    }
  }

  getAllItems() {
    this.itemService.getAllItems().subscribe((response: any) => {
      this.ListAllItems=response.items
      console.log(this.ListAllItems, 'this is a list of  All items');
    });
  }
 
  getPaginatedItems(page: number) {
    this.isLoading=true
    this.pageNumber=page
    localStorage.setItem('pageNumber',this.pageNumber.toString())
    this.itemService.getPaginatedItems(this.pageNumber).subscribe((response:any) => {
      this.isLoading=false
      this.ListItems = response.items;
      this.ListPackages = this.ListItems.map((item:any) => item.packages).flat();
      this.totalPages= response.totalPages
      this.pagesCount();
      console.log(this.ListPackages, 'this is the packages list in  ListItems');
      console.log(this.pageNumber, 'this is  PageNumber');
      console.log(response, 'these are paginated items');
    });
  }

  deleteItem(itemId: number) {
    console.log(itemId);
    this.itemService.deleteItem(itemId).subscribe((response) => {
      console.log(response);
      this.getAllItems();
      this.getPaginatedItems(this.pageNumber);
      this.toastr.error('Item deleted successfully!');
    });
  }
  viewItem(itemId:any){}

  updateItem() {
    this.isLoading=true
    if (this.addItemForm.dirty) {
      const updatedItem ={
        ...this.item,
        subItems: this.selectedSubItems.map(item => item._id),
        packages: this.selectedPackages.map(packages => packages._id)

      }
      this.itemService.updateItem(this.item._id, updatedItem).subscribe({
        next: (response:any) =>{
          this.isLoading=false
          console.log(response);
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber)
          this.toastr.info('Item updated successfully!');
          this.addItemForm.markAsPristine();
          this.addItemForm.reset();
          this.selectedSubItems = [];
          this.selectedPackages=[]
          this.closeUpdateModal();
        },
        error: (error) =>{
          this.isLoading=false
          this.toastr.error('Error Updating Item.');
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
  onSelectPackage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    const selectedPackage = this.filteredPackages.find(pkg => pkg._id === value);
    if (selectedPackage) {
      this.selectedPackages.push(selectedPackage);
      this.filteredPackages = this.filteredPackages.filter(pkg => pkg._id !== selectedPackage._id);
      this.addItemForm.patchValue({ packages: this.selectedPackages.map(pkg => pkg._id) });
    }
  }
  removeSubItem(subItem: any) {
    this.selectedSubItems = this.selectedSubItems.filter(item => item._id !== subItem._id);
    this.subItems.push(subItem);
    this.filteredSubItems.push(subItem);
    this.addItemForm.patchValue({ subItems: this.selectedSubItems.map(item => item._id) });
  }
  removePackage(pkg: any) {
    this.selectedPackages = this.selectedPackages.filter(selected => selected._id !== pkg._id);
    this.packages.push(pkg);
    this.filteredPackages.push(pkg);
    this.addItemForm.patchValue({ packages: this.selectedPackages.map(pkg => pkg._id) });
  }

  filterPackages() {
    const searchPackageTerm = this.addItemForm.get('packageSearch')?.value?.toLowerCase() || '';
    if (searchPackageTerm) {
      this.filteredPackages = this.packages.filter((pkg:any) =>
        pkg.name.toLowerCase().includes(searchPackageTerm)
      );
    } else {
      this.filteredPackages = [...this.packages];
    }
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
  togglepackagesSearch() {
    this.showpackagesSearch = !this.showpackagesSearch;
  }

  selectSubItem(subItem: any) {
    this.selectedSubItems.push(subItem);
    this.subItems = this.subItems.filter((item:any) => item._id !== subItem._id);
    this.filteredSubItems = this.filteredSubItems.filter(item => item._id !== subItem._id);
    this.addItemForm.patchValue({ subItems: this.selectedSubItems.map(item => item._id) });
    this.addItemForm.get('subItemsSearch')?.setValue(''); // Clear search term
    this.showSubItems=false;
  }
 
  selectPackage(pkg: any) {
    this.selectedPackages.push(pkg);
    this.packages = this.packages.filter((item:any) => item._id !== pkg._id);
    this.filteredPackages = this.filteredPackages.filter(item => item._id !== pkg._id);
    this.addItemForm.patchValue({ packages: this.selectedPackages.map(item => item._id) });
    this.addItemForm.get('packageSearch')?.setValue(''); // Clear search term
    this.showPackages = false;
  }
  onFocusActive(){
    this.showSubItems=true
  }
  onFocusActivePackages(){
    this.showPackages=true
  }
 
 
  onBlurActive(){
    this.showSubItems=false;
  }
  getAllSubItems() {
    this.isLoading=true
    this.subItemService.getAllSubItems().subscribe((response:any) => {
      this.isLoading=false
       this.subItems=response.items
    });
  }
  getAllPackages() {
    this.isLoading=true
    this.packageService.getAllPeckage().subscribe((response:any) => {
      this.isLoading=false
       this.packages=response.items
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
  }
  filterIem(){
    const filterName= this.filterForm.value.filtername.toLowerCase() || '';
    this.filterItemArray=this.ListAllItems.filter((item:any)=>{
      const matchesName=item.name.toLowerCase().includes(filterName);
      this.filterErrorShow()
      return matchesName
    });
    if(this.filterItemArray.length==0){
      this.toastr.warning('No items match your filter criteria.');
    }
    
  }
  filterErrorShow(){
    this.filterError=true;
  }
  resetFilteredSubItems() {
    this.filteredSubItems = [...this.subItems];
  }

  resetFilteredPackages() {
    this.filteredPackages = [...this.packages];
  }
  getPackageName(id: string): string {
    const packages = this.packages.find((pkg:any) => pkg._id === id); // Assuming allPackages contains all available packages
    return packages ? packages.name : 'Unknown Package';
  }
}
