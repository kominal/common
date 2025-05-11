import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-label',
  imports: [TranslatePipe],
  templateUrl: './label.component.html',
})
export class LabelComponent {
  public label = input.required<string>();
  public formElement = input.required<AbstractControl>();
}
