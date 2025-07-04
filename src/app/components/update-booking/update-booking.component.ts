import { DatePipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/app/bookings.service';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-update-booking',
  templateUrl: './update-booking.component.html',
  styleUrls: ['./update-booking.component.scss']
})
export class UpdateBookingComponent {
  packageDetails!: any;
  selectedPackage:any
  subItemTotals: { [subItemId: number]: number } = {};
  itemBtn: { [itemId: string]: boolean } = {}
  perPersonSubt = 0
  subItems!:any
  total = 0
  subItemTotal = 0
  advance = 0
  showAllSubItems = false
  smallScreenItems: any
  isScreenLarge = false
  seeBtn = false
  noOfPersons=1
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
  statusOpts=['Pending', 'Advance Paid', 'Fully Paid']
  conflict: any
 validationError : boolean = false
  packages:any
number = [1,2,3,4,5,6,2,3,3,'A','B']
  isLoading: boolean = false;
  dateError: boolean = false;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;

  constructor(
    private packageService: PackagesService,
    private bookingService: BookingsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private subItemService: SubItemsService,
  ) {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      number: ['', Validators.required],
      email: ['', Validators.required],
      // price: ['', Validators.required],
      fromDate: ['', Validators.required],
      fromTime: ['', Validators.required],
      toDate: ['', Validators.required],
      toTime: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      this.item = JSON.parse(params['item']);
      this.addItemForm.patchValue({
        name: this.item.name,
        number: this.item.phone,
        email: this.item.email,
        fromDate: this.extractDate(this.item.fromDate),
        fromTime: this.extractTime(this.item.fromDate),
        toDate: this.extractDate(this.item.toDate),
        toTime: this.extractTime(this.item.toDate),
        status: this.item.status
      });
      console.log('Received item:', this.addItemForm.value);
    });

    this.packageService.getAllPeckage().subscribe({
      next: (response: any) => {
        this.packages = response.items;
        console.log('packages', this.packages);

        this.packages.forEach((pkg: { _id: any; }) => {
          if(pkg._id == this.item.packageId)
            this.getPackageDetails(pkg._id)
        });


      },
      error: (error) => {
        console.log(error);
      },
    });



    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();

    // this.item = {
    //   name: this.addItemForm.value.name,
    //   email: this.addItemForm.value.email,
    //   number: this.addItemForm.value.number,
    //   price: this.addItemForm.value.price,
    //   fromDate: this.addItemForm.value.fromDate,
    //   fromTime: this.addItemForm.value.fromTime,
    //   toDate: this.addItemForm.value.toDate,
    //   toTime: this.addItemForm.value.toTime,
    // };
 this.initializeFieldListeners()

  }

  extractDate(dateTime: string): string {
    console.log('str', dateTime)
    return dateTime ? dateTime.split('T')[0] : ''; // Extract YYYY-MM-DD
  }

  extractTime(dateTime: string): string {
    console.log('str', dateTime)
    return dateTime.split("T")[1].substring(0, 5);
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
  // openModal() {
  //   this.showModal = true;
  //   this.addItemForm.reset();
  //   this.formData.isAvailable = true;
  // }

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

    // this.addItemForm.patchValue({
    //   name: this.item.name,
    //   email: this.item.email,
    //   number: this.item.number,
    //   price: this.item.price,
    //   fromDate: fromDate,
    //   fromTime: fromTime,
    //   toDate: toDate,
    //   toTime: toTime
    // });
    this.showUpdateModal = true;
  }

  onSubmit() {

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
    this.currentBooking=this.item
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



  viewItem(itemId: any) { }

  updateItem() {
    const combinedFromDateTime = `${this.addItemForm.value.fromDate}T${this.addItemForm.value.fromTime}`;
    const combinedToDateTime = `${this.addItemForm.value.toDate}T${this.addItemForm.value.toTime}`;
    this.isLoading = true;
    console.log('val', this.addItemForm.value)

    // if (this.addItemForm.dirty) {
      const updatedItem = {
        // name: this.addItemForm.value.name,
        // email: this.addItemForm.value.email,
        // number: this.addItemForm.value.number,
        // price: this.addItemForm.value.price,
        // fromDate: combinedFromDateTime,
        // toDate: combinedToDateTime,
        // status: this.addItemForm.value.status
        userId: '676ebd9caa6ea87633c515c9',
        name: this.addItemForm.value.name,
        email: this.addItemForm.value.email,
        phone: this.addItemForm.value.number,
        status: this.addItemForm.value.status,
        fromDate: combinedFromDateTime,
        toDate: combinedToDateTime,
          packageId: this.packageDetails?.package?._id,
          noOfPersons: this.noOfPersons,
          totalPrice: this.total.toFixed(2),
          subItems: this.subItems
      };
      console.log(updatedItem, '----------------updated item----');
      this.bookingService.updateItem(this.item._id, updatedItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log(response);
          this.getAllItems();
          this.toastr.info('Item updated successfully!');
          this.addItemForm.markAsPristine();
          this.addItemForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Error Updating Item.');
          console.log(error);
        },
      });
    // }
  }

  initializeQuantities(): void {
    console.log('subs', this.packageDetails.itemsWithSubItems)
    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      item.subItems?.forEach((subItem: any) => {
        this.subItemTotals[subItem._id] = subItem.price;
        // console.log('price', console.log(subItem))
      });
    });

    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      this.itemBtn[item.item._id] = false; // Initialize with the price of each subItem
    });

    this.subItems = []
  this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
    item.subItems?.forEach((subItem: any) => {
      subItem.quantity = 1; // Initialize with the price of each subItem
      this.subItems.push(subItem); // Collect all subItems
    });
  });

  console.log('itemBtn', this.itemBtn);
  console.log('subItemTotals', this.subItemTotals);
}

  getPackageDetails(selectedValue: any) {
    console.log('Selected Package ID:', selectedValue);

    this.packageService.getPackageById(selectedValue).subscribe(
          (response: any) => {
            if (response && response.data) {
              this.packageDetails = response.data;
              this.initializeQuantities()
              this.isLoading = false;
              console.log('package details', this.packageDetails)
            } else {
              this.isLoading = false;
              console.warn('No data found in response');
            }
          },
          (error: any) => {
            this.isLoading = false;
            console.error('Error fetching package details:', error);
          }
        );
  }

  getSubItems(item: any): any[] {
    if (!this.isScreenLarge && !this.itemBtn[item.item._id]) {
      return item.subItems.slice(0, 5); // Limit to 5 sub-items if screen is small
    }
    return item.subItems; // Show all sub-items if screen is large
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isScreenLarge = window.innerWidth > 800;
    console.log('isScreenLarge', this.isScreenLarge)
  }


  getMediaURl(url: string) {
    const mediaUrl = this.subItemService.getMedia(url);
    return mediaUrl.includes('null') ? '' : mediaUrl;
  }

  calculateSubtotal(id: any, price: number, event: Event, itemId: any) {
    const inputElement = event.target as HTMLInputElement;

    const quantity = parseInt(inputElement.value, 10) || 0;

    const subtotal = quantity * price;

    this.subItemTotals[id] = subtotal;

    console.log('subtotal', this.subItemTotals[id])

    // const parentObject = this.subItems.find((obj: any) => obj.item._id === itemId);



        // const subItem = this.subItems.find((sub: any) => sub._id === id);
        this.subItems.forEach((sub: { _id: any; quantity: number; price: number; }) => {
          if(sub._id == id){
            sub.quantity = quantity;
            sub.price = subtotal;
          }
        });

        // if (subItem) {
        //     // Update quantity and subtotal
        //     subItem.quantity = quantity;
        //     subItem.price = subtotal;
        // }
    // }

    console.log('Updated subItems:', this.subItems);
  }

  calculatePersonsSubtotal(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    // Extract and parse the value, defaulting to 0 if invalid
    const quantity = parseInt(inputElement.value, 10) || 0;
    this.noOfPersons = quantity

    this.perPersonSubt = quantity * this.packageDetails.package.price

    console.log('perPersonSubt', this.perPersonSubt, this.total)

    // this.total=this.perPersonSubt

    console.log('perPersonSubt', this.perPersonSubt)
    // console.log('subtotal', subtotal)
  }

  getPersonsSubtotal() {

    return this.perPersonSubt.toFixed(2);
  }

  getSubTotal(id: any) {
    if (this.subItemTotals[id] == null) {
      return '€0.00';
    }


    // Ensure the subtotal is a number before applying toFixed
    const formattedSubtotal = (+this.subItemTotals[id]).toFixed(2);
    return `€${formattedSubtotal}`;
  }

  getSubItemsTotal(): string {
    // Calculate the sum of all the subItemTotals in the subItemTotals object
    this.subItemTotal = Object.values(this.subItemTotals).reduce((sum, subtotal) => sum + (subtotal || 0), 0);

    // Format the total to 2 decimal places
    const formattedTotal = this.subItemTotal.toFixed(2);

    // Return the total formatted as a currency
    return `€${formattedTotal}`;
  }

  getTotal() {
    this.total = this.subItemTotal
    this.total += this.perPersonSubt

    return this.total.toFixed(2)
  }

  getAdvance() {
    this.advance = this.total * 0.4

    return this.advance.toFixed(2)
  }


  toggleItemBtn(id: any) {
    this.itemBtn[id] = !this.itemBtn[id]
    console.log('itemBtn', this.itemBtn[id]);
  }

}
