import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { startWith } from 'rxjs';
import { UtcDirective } from '../directives/utc.directive';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-date',
  imports: [ReactiveFormsModule, LabelComponent, DatePickerModule, UtcDirective],
  templateUrl: './input-date.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputDateComponent {
  private destroyRef = inject(DestroyRef);

  public label = input<string>();
  public formElement = input.required<FormControl<Date>>();

  public required = signal(false);

  public constructor() {
    effect(() => {
      const formElement = this.formElement();
      formElement.statusChanges.pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.required.set(formElement.hasValidator(Validators.required)));
    });
  }
}
