import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-label',
  imports: [TranslatePipe],
  templateUrl: './label.component.html',
})
export class LabelComponent {
  private destroyRef = inject(DestroyRef);

  public label = input.required<string>();
  public formElement = input.required<AbstractControl>();

  public required = signal(false);

  public constructor() {
    effect(() => {
      const formElement = this.formElement();
      formElement.statusChanges.pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.required.set(formElement.hasValidator(Validators.required)));
    });
  }
}
