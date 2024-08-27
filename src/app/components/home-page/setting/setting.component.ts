import { Component } from '@angular/core';
import { SettingService } from '../setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent {
  flatRates: any[] = [];
  editingFlatRate: any = {};
  flatrRatesData: any[] = [];
 constructor(private settingService:SettingService){}
 ngOnInit(): void {
  this.loadFlatRates();
}

loadFlatRates(): void {
  this.settingService.getFlatRate().subscribe(
    (response) => {
      this.flatRates = response.items;
      this.flatrRatesData = response.items;
      console.log(this.flatRates, 'these are the flat rates');
    },
    (error) => console.error('Error loading flat rates:', error)
  );
}

updateFlatRate(id: string, key: string, value: number): void {
  this.settingService.updateFlatRate(id, key, value).subscribe(
    (response) => {
      console.log('Flat rate updated successfully:', response);
      this.loadFlatRates(); // Reload rates after update
    },
    (error) => console.error('Error updating flat rate:', error)
  );
}

onInputChange(id: string, key: string, value: number): void {
  this.updateFlatRate(id, key, value);
}

}
