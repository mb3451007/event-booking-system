import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { PackagesService } from 'src/app/packages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { ItemsModalComponent } from '../items-modal/items-modal.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingsService } from 'src/app/bookings.service';

// const stripePromise = loadStripe(
//   'pk_test_51N2zfiBHAK3VyaqUHLxCAue1ZffFof5jE4X4lRfxvBqffzikRlcQTxj3Lrb3zbVgkmHSob3i2hidx0aQEP153HTM00rJFnDGJo'
// );

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  packages: any;
  errorMsg = ''
  stripe!: Stripe | null;
  elements!: StripeElements;
  card!: StripeCardElement;
  packageDetails: any
  packageId: any
  isLoading: boolean = false;
  timingsForm!: FormGroup;
  fullyBookedMsg = ''
  allAvailable = false
  availableSlotsMsg = ''
  isAvailableSlots = false
  allBooked = false
  toDate = ''
  fromDate = ''
  dateError: boolean = false;
  validationError: boolean = false
  dateSelectionError = ''
  isSlotValid = false
  availabilityMessage: string = ''
  conflict!: any
  bookings: any = [];
  bookingsOnSelectedDate: any = [];

  @ViewChild('dateModal') dateModal!: TemplateRef<any>;


  constructor(
    private packageService: PackagesService,
    private router: Router, private modalService: NgbModal, private fb: FormBuilder,private bookingService: BookingsService
  ) {}

  ngOnInit(): void {
    this.timingsForm = this.fb.group({
      fromDate: ['', Validators.required],
      fromTime: ['', Validators.required],
      toDate: ['', Validators.required],
      toTime: ['', Validators.required],
    });

    this.packageService.getAllPeckage().subscribe({
      next: (response: any) => {
        this.isLoading = true;
        const items = response.items;

        console.log(items.filter((pkg: any) => pkg.name == 'Space Booking'))
        // Separate 'space booking' from others
        const normalPackages = items.filter((pkg: any) => pkg.name.trim().toLowerCase() !== 'space booking');
        const spaceBookingPackages = items.filter((pkg: any) => pkg.name.trim().toLowerCase() === 'space booking');
        // Sort normal packages by price
        normalPackages.sort((a: any, b: any) => a.price - b.price);

        // Put 'space booking' at the end
        this.packages = [...normalPackages, ...spaceBookingPackages];

        console.log('packages', this.packages);
        this.isLoading = false;
      },
      error: (error) => {
        console.log('failed to get pkgs',error);
        this.isLoading = false;
      },
    });

    this.getAllItems()


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


  ngAfterViewInit(): void {
    // Open modal after view is initialized
    setTimeout(() => {
      this.modalService.open(this.dateModal, {
        backdrop: 'static',      // Prevent closing by clicking outside
        keyboard: false,         // Prevent closing with ESC key
        centered: true           // Optional: center the modal
      });
    });
  }


  getItems(id: any){

    this.isLoading = true;

    this.packageService.getPackageById(id).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.packageDetails = response.data;
          console.log('pkg dets', this.packageDetails)
          this.isLoading = false;
          // const modalRef = this.modalService.open(ItemsModalComponent);
          // modalRef.componentInstance.packageDetails = this.packageDetails;

          this.router.navigate(['/package-preview'], {
            queryParams: {
              data: JSON.stringify(this.packageDetails)
            }
          });
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
        this.isAvailableSlots=false
      }
      this.availabilityMessage = message;
    } else {
      this.errorMsg = ''
      this.fullyBookedMsg = ''
      this.availableSlotsMsg = ''
      this.allAvailable = true
      this.availabilityMessage = 'Selected Slot Available!';
      this.allBooked=false

      this.isSlotValid = true

      const fromDateTime = new Date(`${fromDate}T${fromTime}`);
      const toDateTime = new Date(`${toDate}T${toTime}`);

      this.fromDate = fromDateTime.toString();  // Converts to full date-time format
      this.toDate = toDateTime.toString();

      console.log('from and to', this.fromDate, this.toDate)
    }
  }


  continue(){
    if(this.timingsForm.valid){
      const from = `${this.timingsForm.value.fromDate}T${this.timingsForm.value.fromTime}`;
      const to = `${this.timingsForm.value.toDate}T${this.timingsForm.value.toTime}`;

      console.log('from', from)
      console.log('to', to)

      const dateRange = { from, to };
      localStorage.setItem('dateRange', JSON.stringify(dateRange));
    }
  }

}
