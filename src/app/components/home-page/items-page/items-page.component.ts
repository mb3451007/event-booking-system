import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from 'src/app/items.service';
@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  styleUrls: ['./items-page.component.scss']
})
export class ItemsPageComponent implements OnInit{
  ListItems:any =[]
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  formData = { name: '', price: '', isAvailable: false };
  items: Array<{ name: string, price: string, isAvailable: boolean }> = [];
  itemId:any
  addItemForm:FormGroup
AddItmePlus='assets/plus-circle-svgrepo-com.svg'
  item :any

constructor(private itemService:ItemsService, private fb:FormBuilder, private activatedRoute:ActivatedRoute) {
  this.addItemForm = this.fb.group({
    name : ['', Validators.required],
    price : ['', Validators.required],
    isAvailable : ['', Validators.required],
  })
}

ngOnInit(): void {
  this.itemId=this.activatedRoute.snapshot.paramMap.get('itemId');
  console.log(this.itemId,'this is Item Id ........')
  // this.getAllItems();
  this.getPaginatedItems(1)
  
  this.item = {
    name:this.addItemForm.value.name ,
    price: this.addItemForm.value.price,
    isAvailable: this.addItemForm.value.isAvailable,
  };
}
 
  openModal() {
    this.showModal = true;
  }
  openUpdateModal(item: any) {
    this.item = { ...item }; 
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
        isAvailable: this.addItemForm.value.isAvailable
       };
    console.log(this.addItemForm.value,'this is formValue to send data')
    this.itemService.addItem(newItem).subscribe(response => {
      this.getAllItems();
      this.addItemForm.reset();
      this.addItemForm.markAsPristine();
      console.log(response);
      this.closeModal();
    });
  }
  else {
    this.addItemForm.markAllAsTouched();  // Mark all fields as touched to show validation errors
  }
}

  getAllItems() {
    this.itemService.getAllItems().subscribe((response:any) => {
      //  this.ListItems=response.allItems
      // console.log(this.ListItems,'this is a list of items');
    });
  }

  getPaginatedItems(pageNumber: number) {
    this.itemService.getPaginatedItems(pageNumber).subscribe(response => {
      this.ListItems=response.pItems
      console.log(this.ListItems, 'these are peginated items');
      
      console.log(response);
    });
  }

  deleteItem(itemId: number) {
     console.log(itemId)
    this.itemService.deleteItem(itemId).subscribe(response => {
      console.log(response);
      this.getAllItems();
      this.getPaginatedItems(1)
    });
  }

  updateItem() {
    if (this.addItemForm.dirty) {
    this.itemService.updateItem(this.item.id, this.item).subscribe(response => {
      console.log(response);
      this.getAllItems()
      this.addItemForm.markAsPristine();
      this.closeUpdateModal();

    });
  }
  }
}
