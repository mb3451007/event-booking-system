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
      this.flatrRatesData= response.items;
      this.flatRates = response.items;
      this.editingFlatRate = { ...this.flatRates[0] };
      console.log(response.items, 'these are totals flats keys');
    },
    (error) => console.error('Error loading flat rates:', error)
  );
}

updateFlatRate(): void {
  const { _id, key, value } = this.editingFlatRate;
  this.settingService.updateFlatRate(_id, key, value).subscribe(
    (response) => {
      console.log('Flat rate updated successfully:', response);
      this.loadFlatRates(); // Reload rates after update
    },
    (error) => console.error('Error updating flat rate:', error)
  );
}

onInputChange(event: any, field: string): void {
  this.editingFlatRate[field] = event.target.value;
}
}
