import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-number',
  imports: [LabelComponent, InputNumberModule, ReactiveFormsModule],
  templateUrl: './input-number.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputNumberComponent {
  public label = input<string>();
  public formElement = input.required<FormControl<number>>();
  public min = input<number>();
  public max = input<number>();
  public step = input<number>();
  public mode = input<'decimal' | 'currency'>('decimal');
  public currency = input<string>('EUR');
  public useGrouping = input<boolean>(true);
  public placeholder = input<string>();
}
