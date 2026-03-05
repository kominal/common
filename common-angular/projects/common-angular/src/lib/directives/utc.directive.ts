import { Directive, Host, HostListener, Self } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';

@Directive({
  selector: '[useUtc]',
  standalone: true,
})
export class UtcDirective {
  public constructor(@Host() @Self() private calendar: DatePicker) {}

  @HostListener('onSelect') public onSelect(): void {
    this.toUtc();
  }

  @HostListener('onInput') public onInput(): void {
    this.toUtc();
  }

  private toUTC(date: Date): Date {
    if (!date) {
      return date;
    }
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  }

  private toUtc(): void {
    if (this.calendar.value) {
      if (this.calendar.value instanceof Date) {
        this.calendar.value = this.toUTC(this.calendar.value);
      } else if (Array.isArray(this.calendar.value)) {
        this.calendar.value = this.calendar.value.map((date) => this.toUTC(date));
      }
      this.calendar.updateModel(this.calendar.value);
    }
  }
}
