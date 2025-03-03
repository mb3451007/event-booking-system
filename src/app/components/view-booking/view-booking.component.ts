import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/app/bookings.service';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';
import { ChartData } from 'chart.js';
import { BookingItemsServiceService } from 'src/app/booking-items-service.service';

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent {
  booking!:any
  bookingItems!:any
  fromDate!:any
  toDate!:any


  constructor(
    private packageService: PackagesService,
    private bookingService: BookingsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private subItemService: SubItemsService,
    private bookingItemService: BookingItemsServiceService,
  ){
  }


  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.booking = JSON.parse(params['item']);
      console.log('received booking',this.booking)

      this.fromDate=new Date(this.booking.fromDate)
      this.toDate=new Date(this.booking.toDate)
      this.getBookingItems();
    });


  }

  getBookingItems(){
    this.bookingItemService.getBookingItems(this.booking._id).subscribe(
      (response: any) => {
        if (response) {
          this.bookingItems=response.subItems
          console.log('bookingItems', this.bookingItems)
        } else {
          console.warn('No data found in response');
        }
      },
      (error: any) => {
        console.error('Error fetching bookingitem details:', error);
      }
    );
  }


}
