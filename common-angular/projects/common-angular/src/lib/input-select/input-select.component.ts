import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { startWith } from 'rxjs';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-select',
  imports: [SelectModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './input-select.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputSelectComponent {
  private readonly destroyRef = inject(DestroyRef);

  public readonly label = input<string>();
  public readonly formElement = input.required<FormControl<string>>();
  public readonly options = input.required<SelectItem[] | undefined | null>();
  public readonly filter = input(true);

  public readonly required = signal(false);

  public constructor() {
    effect(() => {
      const formElement = this.formElement();
      formElement.statusChanges.pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.required.set(formElement.hasValidator(Validators.required)));
    });
  }
}
