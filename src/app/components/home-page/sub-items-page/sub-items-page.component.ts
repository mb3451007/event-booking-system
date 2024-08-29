import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-sub-items-page',
  templateUrl: './sub-items-page.component.html',
  styleUrls: ['./sub-items-page.component.scss']
})
export class SubItemsPageComponent {
  showModal: boolean = false;
  formData = { name: '', price: '',itemName: '', isAvailable: false };
  availableItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  AddItmePlus='assets/plus-circle-svgrepo-com.svg'
  subItem:any
  pageNumber:number =1
  subItems:any =[]
  showUpdateModal: boolean = false;
  subitemId:any
  addSubItemForm:FormGroup
 

  constructor(private subItemService:SubItemsService, private fb:FormBuilder, private activatedRoute:ActivatedRoute, private toastr: ToastrService) {
    this.addSubItemForm = this.fb.group({
      name : ['', Validators.required],
      price : ['', Validators.required],
      isAvailable : ['', Validators.required],
    })
  }
 
  ngOnInit(): void {
    const localStoragePage=localStorage.getItem('pageNumber')
    this.pageNumber=localStoragePage? parseInt(localStoragePage):1;
    this.subitemId=this.activatedRoute.snapshot.paramMap.get('itemId');
    console.log(this.subitemId,'this is Item Id ........')
    // this.getAllItems();
    this.getPaginatedSubItems(this.pageNumber)
    
    this.subItem = {
      name:this.addSubItemForm.value.name ,
      price: this.addSubItemForm.value.price,
      isAvailable: this.addSubItemForm.value.isAvailable,
    };
  }
   
    openModal() {
      this.showModal = true;
    }
    openUpdateModal(subItem: any) {
      this.subItem = { ...subItem }; 
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
  
  
    addSubItem() {
      const newItem = { 
        name: this.addSubItemForm.value.name,
         price: this.addSubItemForm.value.price,
          isAvailable: this.addSubItemForm.value.isAvailable
         };
      console.log(this.addSubItemForm.value,'this is formValue to send data')
      this.subItemService.addSubItem(newItem).subscribe({
        next: (response:any)=>{
          this.getAllSubItems();
          this.getPaginatedSubItems(this.pageNumber)
          this.toastr.success('SubItem added successfully!');
          console.log(response);
        }, 
        error: (error:any)=>{
         console.log(error);
         this.toastr.error('Error Adding Item!');
        }
        
      });
    }
  
    getAllSubItems() {
      this.subItemService.getAllSubItems().subscribe((response:any) => {
        //  this.subItems=response.allItems
        // console.log(this.subItems,'this is a list of items');
      });
    }
  
    getPaginatedSubItems(page: number) {
      this.pageNumber=page
    localStorage.setItem('pageNumber',this.pageNumber.toString())
      this.subItemService.getPaginatedSubItems(this.pageNumber).subscribe(response => {
        this.subItems=response.items
        console.log(this.subItems, 'these are peginated items');
        
        console.log(response);
      });
    }
  
    deleteSubItem(itemId: number) {
       console.log(itemId)
      this.subItemService.deleteSubItem(itemId).subscribe(response => {

        console.log(response);
        this.getAllSubItems();
        this.getPaginatedSubItems(this.pageNumber)
        this.toastr.error('SubItem deleted successfully!');
      });
    }
  
    updateSubItem() {
      console.log(this.subItem.id);
      console.log(this.subItem);
      
      this.subItemService.updateSubItem(this.subItem._id, this.subItem).subscribe( {
        next : (response:any)=>{
          console.log(response);
          this.closeUpdateModal();
          this.getAllSubItems()
          this.getPaginatedSubItems(this.pageNumber)
          this.toastr.info('SubItem updated successfully!');

        },
        error : (response:any)=>{
          this.toastr.error('Error Updating SubItem!');
          console.log(response);
        }
       
      });
    }
}
