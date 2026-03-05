import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-text',
  imports: [InputTextModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './input-text.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputTextComponent {
  public label = input<string>();
  public formElement = input.required<FormControl<string>>();
  public placeholder = input<string>();
}
