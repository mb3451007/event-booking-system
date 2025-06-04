import { Component, ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/app/bookings.service';
import { EmailServiceService } from 'src/app/email-service.service';
import { SubItemsService } from 'src/app/sub-items.service';


@Component({
  selector: 'app-pre-checkout',
  templateUrl: './pre-checkout.component.html',
  styleUrls: ['./pre-checkout.component.scss']
})


export class PreCheckoutComponent {
  packageDetails!: any;
  isLoading: boolean = false;
  perPersonSubt = 0
  total = 0
  subItemTotal = 0
  advance = 0
  showAllSubItems = false
  smallScreenItems: any
  isScreenLarge = false
  seeBtn = false
  noOfPersons = 1
  timingsForm!: FormGroup;
  contactForm!: FormGroup;
  availabilityMessage: string = ''
  conflict!: any
  dateError: boolean = false;
  validationError: boolean = false
  bookingsOnSelectedDate: any = [];
  bookings: any = [];
  fullyBookedMsg = ''
  allAvailable = false
  availableSlotsMsg = ''
  isAvailableSlots = false
  allBooked = false
  toDate = ''
  fromDate = ''
  isSlotValid = false
  errorMsg = ''
  subItems!: any
  dateSelectionError = ''
  subItemTotals: { [subItemId: string]: number } = {};
  checkedState: { [subItemId: string]: boolean } = {};
  itemBtn: { [itemId: string]: boolean } = {}
  additionalBookableOptions = ['Zusätzlich buchbare Optionen', 'Mobiliar', 'Textilien', 'Tischdekoration', 'Raumdekoration & Outdoordekoration', 'Gedeckter Tisch & co']
  @ViewChild('personInput') personInputRef!: ElementRef;


  constructor(private route: ActivatedRoute,
    private subItemService: SubItemsService,
    private router: Router, private fb: FormBuilder, private bookingService: BookingsService, private emailService: EmailServiceService, private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.timingsForm = this.fb.group({
      fromDate: ['', Validators.required],
      fromTime: ['', Validators.required],
      toDate: ['', Validators.required],
      toTime: ['', Validators.required],
    });

    this.contactForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.getDate()
    this.getAllItems();

    // Retrieve the queryParams
    this.route.queryParams.subscribe(params => {
      const packageData = params['packageData']; // Get the 'packageData' query param
      if (packageData) {
        this.packageDetails = JSON.parse(packageData); // Parse the JSON string into an object
      }
    });


    console.log('smallScreenItems', this.smallScreenItems)

    this.perPersonSubt += this.packageDetails.package.price * this.packageDetails.package.minPersons
    this.total += this.perPersonSubt

    console.log('checkout packageDetails', this.packageDetails)
    if (this.packageDetails) {
      this.initializeQuantities();
    }

    this.checkScreenSize();
    // this.subItems = this.packageDetails.itemsWithSubItems.map((item: { subItems: any; }) => item.subItems);
    this.subItems = []
    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      item.subItems?.forEach((subItem: any) => {
        const subItemCopy = { ...subItem, quantity: 1 }; // Create a shallow copy and initialize quantity
        this.subItems.push(subItemCopy);
      });
    });


    console.log('subitems', this.subItems)
  }

  getDate() {
    const savedRange = JSON.parse(localStorage.getItem('dateRange') || '{}');
    this.fromDate = savedRange.from
    this.toDate = savedRange.to
    console.log('savedRange.from', this.fromDate);
    console.log('savedRange.to', this.toDate);
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

  toggleItemBtn(id: any) {
    this.itemBtn[id] = !this.itemBtn[id]
    console.log('itemBtn', this.itemBtn[id]);
  }

  initializeQuantities(): void {
    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      item.subItems?.forEach((subItem: any) => {
        this.subItemTotals[subItem._id] = subItem.price;
        this.checkedState[subItem._id] = false
      });
    });

    this.packageDetails.itemsWithSubItems?.forEach((item: any) => {
      this.itemBtn[item.item._id] = false; // Initialize with the price of each subItem
    });


    console.log('itemBtn', this.itemBtn);
    console.log('subItemTotals', this.subItemTotals);
    console.log('checkedState', this.checkedState);
  }

  getMediaURl(url: string) {
    const mediaUrl = this.subItemService.getMedia(url);
    return mediaUrl.includes('null') ? '' : mediaUrl;
  }

  calculateSubtotal(id: any, price: number, event: Event, subItem: any) {
    console.log('subItem', subItem)
    const inputElement = event.target as HTMLInputElement;

    const quantity = parseInt(inputElement.value, 10) || 0;

    const subtotal = quantity * price;

    this.subItemTotals[id] = subtotal;
    this.subItems.forEach((sub: { _id: any; quantity: number; price: number; }) => {
      if (sub._id == id) {
        sub.quantity = quantity;
        sub.price = subtotal;
      }
    })
  }

  // calculatePersonsSubtotal(event: Event) {
  //   const inputElement = event.target as HTMLInputElement;

  //   // Extract and parse the value, defaulting to 0 if invalid
  //   const quantity = parseInt(inputElement.value, 10) || 0;
  //   this.noOfPersons = quantity

  //   this.perPersonSubt = quantity * this.packageDetails.package.price

  //   console.log('perPersonSubt', this.perPersonSubt, this.total)

  //   // this.total=this.perPersonSubt

  //   console.log('perPersonSubt', this.perPersonSubt)
  //   // console.log('subtotal', subtotal)
  // }
  calculatePersonsSubtotal(event: Event, enforceLimits: boolean = false) {
    const inputElement = event.target as HTMLInputElement;
    let quantity = parseInt(inputElement.value, 10) || 0;
    console.log('quantity', quantity)
    const min = this.packageDetails.package?.minPersons || 1;
    const max = this.packageDetails.package?.maxPersons || 1;

    if (enforceLimits) {
      // Only enforce limits on blur
      if (quantity < min) quantity = min;
      if (quantity > max) quantity = max;
      inputElement.value = quantity.toString(); // reflect corrected value
    }

    this.noOfPersons = quantity;
    this.perPersonSubt = quantity * this.packageDetails.package.price;
  }



  // getPersonsSubtotal() {
  //     return this.perPersonSubt.toFixed(2);
  // }
  getPersonsSubtotal() {
    if (!this.personInputRef) return '';

    const value = parseInt(this.personInputRef.nativeElement.value, 10);
    const min = this.packageDetails.package?.minPersons || 1;
    const max = this.packageDetails.package?.maxPersons || 1;

    if (value >= min && value <= max) {
      return this.perPersonSubt.toFixed(2);
    }

    return '';
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
    // Calculate the sum of all the subItemTotals where checkedState is true
    // console.log('subItemTotals', this.subItemTotals);
    this.subItemTotal = Object.keys(this.subItemTotals).reduce((sum, subItemId) => {
      if (this.checkedState[subItemId]) {
        const subtotal = this.subItemTotals[subItemId] || 0;
        sum += subtotal;
      }
      return sum;
    }, 0);

    // Format the total to 2 decimal places
    const formattedTotal = this.subItemTotal.toFixed(2);

    // Return the total formatted as a currency
    return `€${formattedTotal}`;
  }



  // getTotal() {
  //   this.total = this.subItemTotal
  //   this.total += this.perPersonSubt

  //   return this.total.toFixed(2)
  // }
  getTotal() {
    const value = parseInt(this.personInputRef?.nativeElement?.value, 10) || 0;
    const min = this.packageDetails.package?.minPersons || 1;
    const max = this.packageDetails.package?.maxPersons || 1;

    this.total = this.subItemTotal;

    if (value >= min && value <= max) {
      this.total += this.perPersonSubt;
    }

    return this.total.toFixed(2);
  }


  getAdvance() {
    this.advance = this.total * 0.4

    return this.advance.toFixed(2)
  }

  preCheckoutPage() {
    const advance = this.advance;

    const finalItems: any[] = []
    this.subItems.forEach((sub: {
      [x: string]: any; quantity: number;
    }) => {
      if (sub.quantity !== 0 && this.checkedState[sub['_id']]) {
        finalItems.push(sub);
      }
    });
    console.log('filteredSubItems', finalItems)
    console.log('total', this.total)
    console.log('subitemstotal', this.subItemTotal)

    const packageName = this.packageDetails?.package?.name || '';
    this.router.navigate(['/checkout'], {
      queryParams: {
        advance: advance.toFixed(2),
        packageName: packageName,
        packageId: this.packageDetails?.package?._id,
        noOfPersons: this.noOfPersons,
        totalPrice: this.total.toFixed(2),
        fromDate: this.fromDate,
        toDate: this.toDate,
        subItems: JSON.stringify(finalItems)
      }
    });
  }

  getAllItems() {
    this.isLoading=true
    this.bookingService.getAllItems().subscribe((response: any) => {
      this.bookings = response.bookings.map((booking: any) => ({
        ...booking,
        fromDate: new Date(booking.fromDate),
        toDate: new Date(booking.toDate),

      }));

      console.log(this.bookings, 'List of all bookings');
    this.isLoading=false

    });
  }

  checkDateValidation() {
    this.dateSelectionError = ''
    const fromDate = this.timingsForm.get('fromDate')?.value;
    const fromTime = this.timingsForm.get('fromTime')?.value;
    const toDate = this.timingsForm.get('toDate')?.value;
    const toTime = this.timingsForm.get('toTime')?.value;

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

  checkAvailability() {
    const fromDate = this.timingsForm.value.fromDate;
    const fromTime = this.timingsForm.value.fromTime;
    const toDate = this.timingsForm.value.toDate;
    const toTime = this.timingsForm.value.toTime;

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

  changeCheckedState(id: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    this.checkedState[id] = isChecked


    console.log('Checkbox for', id, 'is checked:', this.checkedState[id]);

    this.getSubItemsTotal()
  }

  isMaxReached(item: any): boolean {
    const subItems = this.getSubItems(item);
    const checkedCount = subItems.filter(subItem => this.checkedState[subItem._id]).length;
    return checkedCount >= item.item?.max_quantity;
  }

  sendEmail(): void {
    if (this.contactForm.valid) {
      const email = {
        to: 'asifsaad315@gmail.com',
        subject: this.contactForm.value.subject,
        html: this.contactForm.value.description,
      };

      console.log('email', email)
      this.isLoading=true


      this.emailService.sendEmail(email).subscribe({
        next: (resp: any) => {
          console.log(resp);
          this.toastr.success('Email sent successfully!');
          this.isLoading=false
        },
        error: (err) => {
          console.log(err)
          this.toastr.success('Problem sending email!');
          this.isLoading=false
        }
      })
      // TODO: Send the form data to your backend here


      // Reset form
      this.contactForm.reset();

      // Close modal
      const modalEl = document.getElementById('contactModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    }
  }


}

