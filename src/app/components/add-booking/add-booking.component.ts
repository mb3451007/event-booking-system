import { DatePipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/app/bookings.service';
import { EmailServiceService } from 'src/app/email-service.service';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.scss']
})
export class AddBookingComponent {
  dateSelectionError = ''
  packageDetails!: any;
  selectedPackage: any
  subItemTotals: { [subItemId: number]: number } = {};
  itemBtn: { [itemId: string]: boolean } = {}
  perPersonSubt = 0
  subItems!: any
  total = 0
  subItemTotal = 0
  advance = 0
  showAllSubItems = false
  smallScreenItems: any
  isScreenLarge = false
  seeBtn = false
  noOfPersons = 1
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
  currentBooking: any
  statusOpts = ['Pending', 'Advance Paid', 'Fully Paid']
  conflict: any
  validationError: boolean = false
  packages: any
  number = [1, 2, 3, 4, 5, 6, 2, 3, 3, 'A', 'B']
  isLoading: boolean = false;
  dateError: boolean = false;
  showConfirmation: boolean = false;
  itemToDelete: number | null = null;
  fullyBookedMsg = ''
  allAvailable = false
  availableSlotsMsg = ''
  isAvailableSlots = false
  allBooked = false
  toDate = ''
  fromDate = ''
  isSlotValid = false
  errorMsg = ''

  constructor(
    private packageService: PackagesService,
    private emailService: EmailServiceService,
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


    this.packageService.getAllPeckage().subscribe({
      next: (response: any) => {
        this.packages = response.items;

        this.getPackageDetails(this.packages[0]._id)


        console.log('packages', this.packages);
      },
      error: (error) => {
        console.log(error);
      },
    });

    // console.log('pack details before', this.packages)
    // console.log('pack details after', this.packageDetails)



    this.itemId = this.activatedRoute.snapshot.paramMap.get('itemId');
    this.getAllItems();

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
        const subItemCopy = { ...subItem, quantity: 1 }; // Create a shallow copy and initialize quantity
        this.subItems.push(subItemCopy);
      });
    });

    console.log('itemBtn', this.itemBtn);
    console.log('subItemTotals', this.subItemTotals);
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

    const fromDateTime = new Date(`${fromDate}T${fromTime}`).getTime();
    const toDateTime = new Date(`${toDate}T${toTime}`).getTime();

    if (!fromTime || !toDate || !toTime) {
      return;
    }

    let overlaps = false;
    let availableSlots: string[] = [];
    let fullyBookedDays: string[] = [];

    // Iterate over each day in the selected range
    let currentDate = new Date(fromDate);
    while (currentDate <= new Date(toDate)) {
      const formattedDate = currentDate.setHours(0, 0, 0, 0);
      const startOfDay = new Date(currentDate).setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate).setHours(23, 59, 59, 999);

      // Get bookings for this specific date
      const bookingsOnDate = this.bookings.filter((booking: any) => {
        const bookingStart = new Date(booking.fromDate).getTime();
        const bookingEnd = new Date(booking.toDate).getTime();
        return (
          (bookingStart <= endOfDay && bookingEnd >= startOfDay) || // Booking covers this whole day
          (bookingStart >= startOfDay && bookingStart <= endOfDay) // Booking starts in this day
        );
      });

      // If there's a booking covering the entire day, mark it as fully booked
      let isFullyBooked = bookingsOnDate.some((booking: any) => {
        const bookingFromDateTime = new Date(booking.fromDate).getTime();
        const bookingToDateTime = new Date(booking.toDate).getTime();
        return bookingFromDateTime <= startOfDay && bookingToDateTime >= endOfDay;
      });

      if (isFullyBooked) {
        fullyBookedDays.push(new Date(currentDate).toLocaleDateString('en-US'));

        overlaps = true;
      } else {
        let lastEndTime = startOfDay;

        // Sort bookings by start time
        bookingsOnDate.sort(
          (a: any, b: any) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );

        bookingsOnDate.forEach((booking: any) => {
          const bookingFromDateTime = new Date(booking.fromDate).getTime();
          const bookingToDateTime = new Date(booking.toDate).getTime();

          // Check if user-selected slot overlaps with existing booking
          if (!(toDateTime <= bookingFromDateTime || fromDateTime >= bookingToDateTime)) {
            overlaps = true;
          }

          // If there's a gap between lastEndTime and this booking, mark it as an available slot
          if (lastEndTime < bookingFromDateTime) {
            availableSlots.push(
              `${new Date(lastEndTime).toLocaleDateString('en-US')} - ${new Date(lastEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} to ${new Date(bookingFromDateTime).toLocaleDateString('en-US')} - ${new Date(bookingFromDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
            );
          }
          lastEndTime = bookingToDateTime; // Update last end time
        });

        // Add final available slot before end of the day
        if (lastEndTime < endOfDay) {
          availableSlots.push(
            `${new Date(lastEndTime).toLocaleDateString('en-US')} - ${new Date(lastEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} to ${new Date(endOfDay).toLocaleDateString('en-US')} - ${new Date(endOfDay).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
          );
        }
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Show availability based on whether overlap was found
    if (overlaps) {
      this.isSlotValid = false
      this.errorMsg = 'Please select an available slot for booking!'
      let message = '';
      this.fullyBookedMsg = ''
      this.availableSlotsMsg = ''
      if (fullyBookedDays.length > 0 && availableSlots.length > 0) {
        this.fullyBookedMsg += `${fullyBookedDays.join(', ')}. `;
        this.isAvailableSlots = true;
      }
      if (availableSlots.length > 0) {
        this.availableSlotsMsg += `${availableSlots.join(', ')}`;
        this.isAvailableSlots = true;
        console.log('availableSlots', availableSlots)
      } else if (fullyBookedDays.length > 0 && availableSlots.length === 0) {
        message = 'No available slots for your selected range.';
        this.allBooked = true;
        this.isAvailableSlots = false

      }
      this.availabilityMessage = message;
    } else {
      this.errorMsg = ''
      this.fullyBookedMsg = ''
      this.availableSlotsMsg = ''
      this.allAvailable = true
      this.availabilityMessage = 'Selected Slot Available!';
      this.allBooked = false
      this.isSlotValid = true

      const fromDateTime = new Date(`${fromDate}T${fromTime}`);
      const toDateTime = new Date(`${toDate}T${toTime}`);

      this.fromDate = fromDateTime.toString();  // Converts to full date-time format
      this.toDate = toDateTime.toString();

      console.log('from and to', this.fromDate, this.toDate)
    }
  }


  checkDateValidation() {
    this.dateSelectionError = ''
    const fromDate = this.addItemForm.get('fromDate')?.value;
    const fromTime = this.addItemForm.get('fromTime')?.value;
    const toDate = this.addItemForm.get('toDate')?.value;
    const toTime = this.addItemForm.get('toTime')?.value;

    const currentDateTime = new Date(); // Get the current date and time

    if (fromDate && fromTime && toDate && toTime) {
      // Combine the date and time into a single Date object for comparison
      const combinedFromDateTime = new Date(`${fromDate}T${fromTime}`);
      const combinedToDateTime = new Date(`${toDate}T${toTime}`);

      // Check if either date is less than the current date
      if (combinedFromDateTime < currentDateTime || combinedToDateTime < currentDateTime) {
        // Error if either date is in the past
        this.dateError = true;
        this.validationError = true;
        this.dateSelectionError = 'From Date must be greater than current date!'
      } else if (combinedFromDateTime >= combinedToDateTime) {
        // To Date must be greater than From Date
        this.dateError = true;
        this.validationError = true;
        this.dateSelectionError = 'To Date must be greater than From Date!'
      } else {
        this.dateError = false;
        this.validationError = false;
      }
    } else {
      // Reset errors if any field is missing
      this.dateError = false;
      this.validationError = false;
      this.dateSelectionError = ''
    }
  }


  // checkDateValidation() {
  //   const fromDate = this.addItemForm.get('fromDate')?.value;
  //   const fromTime = this.addItemForm.get('fromTime')?.value;
  //   const toDate = this.addItemForm.get('toDate')?.value;
  //   const toTime = this.addItemForm.get('toTime')?.value;

  //   if (fromDate && fromTime && toDate && toTime) {
  //     // Combine the date and time into a single Date object for comparison
  //     const combinedFromDateTime = new Date(`${fromDate}T${fromTime}`);
  //     const combinedToDateTime = new Date(`${toDate}T${toTime}`);

  //     // Compare the two datetime objects
  //     if (combinedFromDateTime >= combinedToDateTime) {
  //       // To Date must be greater than From Date
  //       this.dateError = true;
  //       this.validationError = true;
  //     } else {
  //       this.dateError = false;
  //       this.validationError = false;
  //     }
  //   } else {
  //     // Reset errors if any field is missing
  //     this.dateError = false;
  //     this.validationError = false;
  //   }
  // }


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
    if (this.addItemForm.dirty) {
      const updatedItem = {
        name: this.addItemForm.value.name,
        email: this.addItemForm.value.email,
        number: this.addItemForm.value.number,
        price: this.addItemForm.value.price,
        fromDate: combinedFromDateTime,
        toDate: combinedToDateTime,
        status: this.addItemForm.value.status
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
    }
  }
  getPackageDetails(selectedValue: any) {
    console.log('Selected Package ID:', selectedValue);

    this.packageService.getPackageById(selectedValue).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.packageDetails = response.data;
          this.perPersonSubt += this.packageDetails.package.price
          this.total += this.perPersonSubt
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
      if (sub._id == id) {
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

  addItem() {

    const advance = this.advance;


    const combinedFromDateTime = `${this.addItemForm.value.fromDate}T${this.addItemForm.value.fromTime}`;
    const combinedToDateTime = `${this.addItemForm.value.toDate}T${this.addItemForm.value.toTime}`;

    if (new Date(combinedFromDateTime) >= new Date(combinedToDateTime)) {
      this.toastr.warning('To Date & Time must be greater than From Date & Time');
      return;
    }
    this.isLoading = true;

    if (this.addItemForm.valid) {
      const packageName = this.packageDetails?.package?.name || '';
      const newItem = {
        userId: '676ebd9caa6ea87633c515c9',
        name: this.addItemForm.value.name,
        email: this.addItemForm.value.email,
        phone: this.addItemForm.value.number,
        status: this.addItemForm.value.status,
        fromDate: combinedFromDateTime,
        toDate: combinedToDateTime,
        advance: advance.toFixed(2),
        packageName: packageName,
        packageId: this.packageDetails?.package?._id,
        noOfPersons: this.noOfPersons,
        totalPrice: this.total.toFixed(2),
        subItems: this.subItems
      };
      console.log('formVal', this.addItemForm.value);
      console.log(newItem, 'jjhjhj');

      this.bookingService.addItem(newItem).subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const formatTime = (dateTime: string) => {
            const [date, time] = dateTime.split(' ');
            let [hours, minutes] = time.split(':');
            const suffix = +hours >= 12 ? 'PM' : 'AM';
            hours = (+hours % 12 || 12).toString(); // Convert 24-hour to 12-hour format
            return `${date}, ${hours}:${minutes} ${suffix}`;
          };

          const email = {
            to: newItem.email,
            subject: `Booking Confirmation - ${newItem.packageName}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #000000;">
                <p>Dear <strong>${newItem.name}</strong>,</p>

                <p>Your booking has been successfully created. Here are the details:</p>

                <p>📅 <strong>Date & Time:</strong> From <span style="color: #333;">${formatTime(newItem.fromDate.replace('T', ' '))}</span> to <span style="color: #333;">${formatTime(newItem.toDate.replace('T', ' '))}</span></p>
                <p>📍 <strong>Package:</strong> <span style="color: #333;">${newItem.packageName}</span></p>
                <p>👥 <strong>Number of Persons:</strong> <span style="color: #333;">${newItem.noOfPersons}</span></p>
                <p>💰 <strong>Total Price:</strong> <span style="color: #333;">${newItem.totalPrice}</span></p>
                <p>🟡 <strong>Payment Status:</strong> <span style="color: #333;">${newItem.status}</span></p>

                <p>If you have any questions, feel free to reach out.</p>

                <p>Best regards,<br> <strong>Adlerpalast</strong></p>
              </div>
            `
          };


          this.emailService.sendEmail(email).subscribe({
          next: (resp: any) => {
            console.log(response);

          },
          error: (err) => {
            console.log(err)
          }
        })

          this.toastr.success('Item added successfully!');
        this.getAllItems();
        this.addItemForm.reset();
        this.addItemForm.markAsPristine();
        console.log(response);
      },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Error Adding Item.');
          console.log(err);
        },
      });
  } else {
  console.log('invalid')
  Object.keys(this.addItemForm.controls).forEach((key) => {
    const controlErrors = this.addItemForm.controls[key].errors;
    if (controlErrors) {
      console.log(`Field "${key}" has errors:`, controlErrors);
    }
  });
  this.addItemForm.markAllAsTouched();
}
  }
}
