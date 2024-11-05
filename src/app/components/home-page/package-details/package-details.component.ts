import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackagesService } from 'src/app/packages.service';
import { SubItemsService } from 'src/app/sub-items.service';

@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss'],
})
export class PackageDetailsComponent implements OnInit {
  packageDetails: any = {}; // Initialize with an empty object
  isLoading: boolean = false;
  packageId: any;
  checkingPackagesData: any = {};

  constructor(
    private route: ActivatedRoute,
    private packageService: PackagesService,
    private router: Router,
    private subItemService: SubItemsService
  ) {}

  ngOnInit(): void {
    this.checkingPackagesData['package'] = history.state;

    console.log(history.state, 'Hereeeeeeeeeeeeeeeeeeeeeeeeeeee');

    this.packageId = this.route.snapshot.paramMap.get('itemId');

    this.getPackageDetails();
  }

  getPackageDetails(): void {
    this.isLoading = true;
    this.packageService.getPackageById(this.packageId).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          if (history.state.isAvailable === true) {
            this.checkingPackagesData.itemsWithSubItems =
              response.data.itemsWithSubItems;
            this.packageDetails = this.checkingPackagesData;
            history.state.isAvailable = false;
            console.log('Package details from backend ', response.data);
            console.log('Package Details If history:', this.packageDetails);
          } else {
            this.packageDetails = response.data;

            console.log('Package Details Else  history:', this.packageDetails);
          }
        } else {
          console.warn('No data found in response');
        }
      },
      (error) => {
        console.error('Error fetching package details:', error);
      }
    );
  }
  getMediaURl(url: string) {
    const mediaUrl = this.subItemService.getMedia(url);
    return mediaUrl.includes('undefined') ? '' : mediaUrl;
  }
}
