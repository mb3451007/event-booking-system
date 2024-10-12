import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PackagesService } from 'src/app/packages.service';


@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss']
})
export class PackageDetailsComponent implements OnInit {
  packageDetails: any = {}; // Initialize with an empty object
  isLoading: boolean = false;
  packageId: any;

  constructor(
    private route: ActivatedRoute,
    private packageService: PackagesService
  ) {}

  ngOnInit(): void {
    this.packageId = this.route.snapshot.paramMap.get('itemId');
    this.getPackageDetails();
  }

  getPackageDetails(): void {
    this.isLoading = true;
    this.packageService.getPackageById(this.packageId).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.packageDetails = response.data;
          console.log('Package Details:', this.packageDetails);
        } else {
          console.warn('No data found in response');
        }
      },
      (error) => {
        console.error('Error fetching package details:', error);
      }
    );
  }
}
