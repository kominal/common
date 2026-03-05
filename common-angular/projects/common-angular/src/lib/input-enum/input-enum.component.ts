import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { startWith } from 'rxjs';
import { LabelComponent } from '../label/label.component';
import { TranslateSelectItemsPipe } from '../pipes/translate-select-items.pipe';
import { toSelectItems } from '../util';

@Component({
  selector: 'app-input-enum',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, CommonModule, TranslateSelectItemsPipe, TranslateModule, LabelComponent, SelectButtonModule],
  templateUrl: './input-enum.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputEnumComponent {
  private destroyRef = inject(DestroyRef);

  public label = input<string>();
  public enum = input.required<any>();
  public enumName = input.required<string>();
  public formElement = input.required<FormControl<any>>();
  public mode = input<'DROPDOWN' | 'BUTTON'>('DROPDOWN');

  public options = computed(() => toSelectItems(this.enumName(), this.enum()));

  public required = signal(false);

  public constructor() {
    effect(() => {
      const formElement = this.formElement();
      // TODO: Arrays
      formElement.statusChanges.pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.required.set(formElement.hasValidator(Validators.required)));
    });
  }
}
