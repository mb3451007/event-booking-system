import { Component } from '@angular/core';
import { SettingService } from 'src/app/setting.service';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent {
  flatRates: any[] = [];
  editingFlatRate: any = {};
  flatrRatesData: any[] = [];
  isLoading: boolean = false
  constructor(private settingService: SettingService) { }
  ngOnInit(): void {
    this.loadFlatRates();
  }

  loadFlatRates(): void {
    this.isLoading = true
    this.settingService.getFlatRate().subscribe(
      (response) => {
        this.isLoading = false
        this.flatRates = response.items;
        this.flatrRatesData = response.items;
        console.log(this.flatRates, 'these are the flat rates');
      },
      (error) =>{
        this.isLoading=false
        console.error('Error loading flat rates:', error)
      } 
    );
  }

  updateFlatRate(id: string, key: string, value: number): void {
    this.isLoading = true
    this.settingService.updateFlatRate(id, key, value).subscribe(
      (response) => {
        this.isLoading = false
        console.log('Flat rate updated successfully:', response);
        this.loadFlatRates(); // Reload rates after update
      },
      (error) => {
        this.isLoading = false
        console.error('Error updating flat rate:', error)
      }
    );
  }

  onInputChange(id: string, key: string, value: number): void {
    this.updateFlatRate(id, key, value);
  }

}
