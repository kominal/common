import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { startWith } from 'rxjs';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-multi-select',
  imports: [MultiSelectModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './input-multi-select.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputMultiSelectComponent<T extends string | number> {
  private destroyRef = inject(DestroyRef);

  public label = input<string>();
  public formElement = input.required<FormControl<T[]>>();
  public options = input.required<SelectItem<T>[] | undefined | null>();

  public required = signal(false);

  public constructor() {
    effect(() => {
      const formElement = this.formElement();
      formElement.statusChanges.pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.required.set(formElement.hasValidator(Validators.required)));
    });
  }
}
