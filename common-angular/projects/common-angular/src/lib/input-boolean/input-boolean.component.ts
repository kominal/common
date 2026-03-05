import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-boolean',
  imports: [ToggleSwitchModule, LabelComponent, ReactiveFormsModule],
  templateUrl: './input-boolean.component.html',
  host: { class: 'flex items-center gap-3 w-full' },
})
export class InputBooleanComponent {
  public label = input<string>();
  public formElement = input.required<FormControl<boolean>>();
}
