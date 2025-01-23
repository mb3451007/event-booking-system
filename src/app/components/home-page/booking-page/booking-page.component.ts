import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/app/bookings.service';
import { ItemsService } from 'src/app/items.service';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],
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
export class BookingPageComponent {
  currentPage = 1;
  pagination: number[] = [];
  autoitems: string[] = [];
  autopackages: string[] = [];
  filteredItems: string[] = [];
  showPackages: boolean = false;
  ListItems: any = [];
  ListPackages: any = [];
  bookings: any = [];
  bookingsOnSelectedDate: any = [];
  pListItems: any = [];
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  formData = { name: '', price: '', isAvailable: true };
  items: Array<{ name: string; price: string; isAvailable: boolean }> = [];
  itemId: any;
  addItemForm: FormGroup;
  filterItemArray: any[] = [];
  pageCountArray: any[] = [];
  AddItmePlus = 'assets/plus-circle-svgrepo-com.svg';
  item: any;
  showSubItemsSearch: boolean = false;
  showpackagesSearch: boolean = false;
  availabilityMessage: string = ''
  currentBooking:any

  conflict: any
 validationError : boolean = false

number = [1,2,3,4,5,6,2,3,3,'A','B']
  filteredPackages: any[] = [];
  pageNumber: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  dateError: boolean = false;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;
  constructor(
    private bookingService: BookingsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      number: ['', Validators.required],
      email: ['', Validators.required],
      price: ['', Validators.required],
      fromDate: ['', Validators.required],
      fromTime: ['', Validators.required],
      toDate: ['', Validators.required],
      toTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();
    this.getPaginatedItems(this.pageNumber);
    this.pagesCount();

    this.item = {
      name: this.addItemForm.value.name,
      email: this.addItemForm.value.email,
      number: this.addItemForm.value.number,
      price: this.addItemForm.value.price,
      fromDate: this.addItemForm.value.fromDate,
      fromTime: this.addItemForm.value.fromTime,
      toDate: this.addItemForm.value.toDate,
      toTime: this.addItemForm.value.toTime,
    };
 this.initializeFieldListeners()

  }

  initializeFieldListeners(): void {
    this.addItemForm.get('fromDate')?.valueChanges.subscribe((fromDate) => {
      if (fromDate) {
        this.addItemForm.get('fromTime')?.enable(); 
      } else {
        this.addItemForm.get('fromTime')?.disable(); 
        this.addItemForm.get('toDate')?.disable(); 
        this.addItemForm.get('toTime')?.disable(); 
      }
    });

    this.addItemForm.get('fromTime')?.valueChanges.subscribe((fromTime) => {
      const fromDate = this.addItemForm.get('fromDate')?.value;
      if (fromDate && fromTime) {
        this.addItemForm.get('toDate')?.enable(); 
      } else {
        this.addItemForm.get('toDate')?.disable(); 
        this.addItemForm.get('toTime')?.disable(); 
      }
    });

    this.addItemForm.get('toDate')?.valueChanges.subscribe((toDate) => {
      const fromDate = this.addItemForm.get('fromDate')?.value;
      const fromTime = this.addItemForm.get('fromTime')?.value;
      if (fromDate && fromTime && toDate) {
        this.addItemForm.get('toTime')?.enable(); 
      } else {
        this.addItemForm.get('toTime')?.disable();
      }
    });
  }
  openModal() {
    this.showModal = true;
    this.addItemForm.reset();
    this.formData.isAvailable = true;
  }

  selectedID = '';

  openUpdateModal(item: any) {
    this.currentBooking = item;
    this.item = { ...item };

   const fromDateObj = new Date(this.item.fromDate);
   const fromTimeObj = new Date(this.item.fromTime);
   const toDateObj = new Date(this.item.toDate);
   const toTimeObj = new Date(this.item.toTime);
 

   const fromDate = this.datePipe.transform(fromDateObj, 'yyyy-MM-dd');
   const fromTime = this.datePipe.transform(fromDateObj, 'HH:mm');
   const toDate = this.datePipe.transform(toDateObj, 'yyyy-MM-dd');
   const toTime = this.datePipe.transform(toDateObj, 'HH:mm');
 
    this.addItemForm.patchValue({
      name: this.item.name,
      email: this.item.email,
      number: this.item.number,
      price: this.item.price,
      fromDate: fromDate,
      fromTime: fromTime,
      toDate: toDate,
      toTime: toTime
    });
    this.showUpdateModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.addItemForm.value.toDate = null;
    this.addItemForm.value.toTime = null;
    this.addItemForm.value.fromDate = null;
    this.addItemForm.value.fromTime = null;
    this.bookingsOnSelectedDate=[]
    this.availabilityMessage='';
    this.addItemForm.reset();
  }
  closeUpdateModal() {
    this.showUpdateModal = false;
    this.addItemForm.value.toDate = null;
    this.addItemForm.value.toTime = null;
    this.addItemForm.value.fromDate = null;
    this.addItemForm.value.fromTime = null;
    this.bookingsOnSelectedDate=[]
    this.availabilityMessage='';
    this.addItemForm.reset();
  }

  onSubmit() {
    this.closeModal();
  }

  checkAvailability() {
    const fromDate = this.addItemForm.value.fromDate; 
    const fromTime = this.addItemForm.value.fromTime; 
    const toDate = this.addItemForm.value.toDate;
    const toTime = this.addItemForm.value.toTime;
  
   
    if (!fromDate) {
      this.bookingsOnSelectedDate = [];
      this.availabilityMessage = '';
      this.conflict = null;
      return;
    }
  
   
    const formattedFromDate = new Date(fromDate).setHours(0, 0, 0, 0); 
  
   
    this.bookingsOnSelectedDate = this.bookings.filter((booking: any) => {
      const bookingFromDate = new Date(booking.fromDate).setHours(0, 0, 0, 0); 
      return bookingFromDate === formattedFromDate;
    });
  
   
    if (this.bookingsOnSelectedDate.length > 0) {
      this.availabilityMessage = 'Some bookings already exist on this date.';
    } else {
      this.availabilityMessage = 'No bookings on this date.';
    }
  
 
    if (fromDate && fromTime && toDate && toTime) {
      const fromDateTime = new Date(`${fromDate}T${fromTime}`).getTime();
      const toDateTime = new Date(`${toDate}T${toTime}`).getTime();
  
    
      this.conflict = this.bookings.find((booking: any) => {
        const bookingFromDateTime = new Date(booking.fromDate).getTime();
        const bookingToDateTime = new Date(booking.toDate).getTime();
  
        return (
          (fromDateTime >= bookingFromDateTime && fromDateTime < bookingToDateTime) || 
          (toDateTime > bookingFromDateTime && toDateTime <= bookingToDateTime) || 
          
          (fromDateTime <= bookingFromDateTime && toDateTime >= bookingToDateTime) 
          
        );
      });
  
      if (this.conflict) {
        this.availabilityMessage = `Booking already reserved from ${new Date(
          this.conflict.fromDate
        ).toLocaleString()} to ${new Date(this.conflict.toDate).toLocaleString()}`;
      } else {
        this.availabilityMessage = 'This time is available for booking!';
      }
    }
  }  
  checkAvailabilityForUpDate() {
    const fromDate = this.addItemForm.value.fromDate;
    const fromTime = this.addItemForm.value.fromTime;
    const toDate = this.addItemForm.value.toDate;
    const toTime = this.addItemForm.value.toTime;
  
    // If no fromDate is provided, reset everything
    if (!fromDate) {
      this.bookingsOnSelectedDate = [];
      this.availabilityMessage = '';
      this.conflict = null;
      return;
    }
  
    // Format the selected fromDate for comparison
    const formattedFromDate = new Date(fromDate).setHours(0, 0, 0, 0);
  
    // Filter bookings for the selected date, excluding the current booking being updated
    this.bookingsOnSelectedDate = this.bookings.filter((booking: any) => {
      const bookingFromDate = new Date(booking.fromDate).setHours(0, 0, 0, 0);
      return bookingFromDate === formattedFromDate && booking._id !== this.currentBooking._id;
    });
  
    // Update availability message based on bookings on the same day
    if (this.bookingsOnSelectedDate.length > 0) {
      this.availabilityMessage = 'Some bookings already exist on this date.';
    } else {
      this.availabilityMessage = 'No bookings on this date.';
    }
  
    // Check for conflicts if all fields are provided
    if (fromDate && fromTime && toDate && toTime) {
      const fromDateTime = new Date(`${fromDate}T${fromTime}`).getTime();
      const toDateTime = new Date(`${toDate}T${toTime}`).getTime();
  
      // Find conflicts with other bookings, excluding the current booking being updated
      this.conflict = this.bookings.find((booking: any) => {
        if (booking._id === this.currentBooking._id) return false; // Skip the current booking
  
        const bookingFromDateTime = new Date(booking.fromDate).getTime();
        const bookingToDateTime = new Date(booking.toDate).getTime();
  
        return (
          (fromDateTime >= bookingFromDateTime && fromDateTime < bookingToDateTime) || // Starts during another booking
          (toDateTime > bookingFromDateTime && toDateTime <= bookingToDateTime) || // Ends during another booking
          (fromDateTime <= bookingFromDateTime && toDateTime >= bookingToDateTime) // Fully overlaps another booking
        );
      });
  
      // Update the availability message based on conflicts
      if (this.conflict) {
        this.availabilityMessage = `Booking already reserved from ${new Date(
          this.conflict.fromDate
        ).toLocaleString()} to ${new Date(this.conflict.toDate).toLocaleString()}`;
      } else {
        this.availabilityMessage = 'This time is available for booking!';
      }
    }
  }
  

 
  
  checkDateValidation() {
    const fromDate = this.addItemForm.get('fromDate')?.value;
    const fromTime = this.addItemForm.get('fromTime')?.value;
    const toDate = this.addItemForm.get('toDate')?.value;
    const toTime = this.addItemForm.get('toTime')?.value;
  
    if (fromDate && fromTime && toDate && toTime) {
      // Combine the date and time into a single Date object for comparison
      const combinedFromDateTime = new Date(`${fromDate}T${fromTime}`);
      const combinedToDateTime = new Date(`${toDate}T${toTime}`);
  
      // Compare the two datetime objects
      if (combinedFromDateTime >= combinedToDateTime) {
        // To Date must be greater than From Date
        this.dateError = true;
        this.validationError = true;
      } else {
        this.dateError = false;
        this.validationError = false;
      }
    } else {
      // Reset errors if any field is missing
      this.dateError = false;
      this.validationError = false;
    }
  }
  
  addItem() {


    const combinedFromDateTime = `${this.addItemForm.value.fromDate}T${this.addItemForm.value.fromTime}`;
    const combinedToDateTime = `${this.addItemForm.value.toDate}T${this.addItemForm.value.toTime}`;
  
    if (new Date(combinedFromDateTime) >= new Date(combinedToDateTime)) {
      this.toastr.warning('To Date & Time must be greater than From Date & Time');
      return;
    }
    this.isLoading = true;
    if (this.addItemForm.valid) {
      const newItem = {
        name: this.addItemForm.value.name,
        email: this.addItemForm.value.email,
        number: this.addItemForm.value.number,
        price: this.addItemForm.value.price,
        fromDate: combinedFromDateTime,
        toDate: combinedToDateTime,
      };
      console.log('formVal', this.addItemForm.value);
      console.log(newItem, 'jjhjhj');
      this.bookingService.addItem(newItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.toastr.success('Booking added successfully!');
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.addItemForm.reset();
          this.addItemForm.markAsPristine();
          console.log(response);
          this.closeModal();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Error Adding Booking.');
          console.log(err);
        },
      });
    } else {
      this.addItemForm.markAllAsTouched();
    }
  }

  getAllItems() {
    this.bookingService.getAllItems().subscribe((response: any) => {
      this.bookings = response.bookings.map((booking: any) => ({
        ...booking,
        fromDate: new Date(booking.fromDate),
        toDate: new Date(booking.toDate),
        
      }));
      
      console.log(this.bookings, 'List of all bookings');
    });
  }
  

  getPaginatedItems(page: number) {
    this.isLoading = true;
    this.pageNumber = page;
    this.bookingService
      .getPaginatedItems(this.pageNumber)
      .subscribe((response: any) => {
        this.isLoading = false;
        this.ListItems = response.bookings;
        this.totalPages = response.totalPages;
        console.log(this.ListItems, 'this is response list');
        console.log(this.totalPages, 'this is response pages');
        this.updatePagination();
        this.pagesCount();
        if (this.pageNumber > response.totalPages) {
          this.getPaginatedItems(this.pageNumber - 1);
        }
      });
  }

  deleteItem(itemId: number) {
    this.itemToDelete = itemId;
    this.showConfirmation = true;
  }

  handleConfirmation(confirm: boolean) {
    if (confirm && this.itemToDelete !== null) {
      this.bookingService.deleteItem(this.itemToDelete).subscribe(
        (response) => {
          this.toastr.success('Boooking deleted successfully!');
          this.itemToDelete = null;
          this.showConfirmation = false;
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
        },
        (error) => {
          this.toastr.error('Error deleting Boooking!');
        }
      );
    } else {
      this.showConfirmation = false;
    }
  }

  viewItem(itemId: any) { }

  updateItem() {
    const combinedFromDateTime = `${this.addItemForm.value.fromDate}T${this.addItemForm.value.fromTime}`;
    const combinedToDateTime = `${this.addItemForm.value.toDate}T${this.addItemForm.value.toTime}`;
    this.isLoading = true;
    if (this.addItemForm.dirty) {
      const updatedItem = {
        name: this.addItemForm.value.name,
        email: this.addItemForm.value.email,
        number: this.addItemForm.value.number,
        price: this.addItemForm.value.price,
        fromDate: combinedFromDateTime,
        toDate: combinedToDateTime,
      };
      console.log(updatedItem, '----------------updated item----');
      this.bookingService.updateItem(this.item._id, updatedItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log(response);
          this.getAllItems();
          this.getPaginatedItems(this.pageNumber);
          this.toastr.info('Boooking updated successfully!');
          this.addItemForm.markAsPristine();
          this.addItemForm.reset(); // reset
          this.closeUpdateModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Error Updating Boooking.');
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
  }




  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
      this.closeUpdateModal();
    }
  }
  onPageChange(page: number): void {
    console.log('Page changed to:' + page);
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageNumber = page;
    this.updatePagination();
    this.getPaginatedItems(this.pageNumber);
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
