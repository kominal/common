import { Component, effect, input, viewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Textarea, TextareaModule } from 'primeng/textarea';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-input-textarea',
  imports: [TextareaModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './input-textarea.component.html',
  host: { class: 'flex flex-col gap-1 w-full' },
})
export class InputTextareaComponent {
  public label = input<string>();
  public formElement = input.required<FormControl<string>>();

  private textareas = viewChildren(Textarea);

  public constructor() {
    effect(() => {
      const textareas = this.textareas();
      const formElement = this.formElement();
      if (textareas && formElement) {
        textareas.forEach((inputTextarea) => {
          inputTextarea.el.nativeElement.style.minHeight = `${inputTextarea.el.nativeElement.scrollHeight}px`;
        });
        formElement.valueChanges.subscribe(() => {
          textareas.forEach((inputTextarea) => {
            inputTextarea.el.nativeElement.style.minHeight = undefined;
          });
        });
      }
    });
  }
}
