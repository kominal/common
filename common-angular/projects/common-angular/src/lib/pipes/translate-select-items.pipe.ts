import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, SelectItem } from 'primeng/api';
import { map, Observable, startWith } from 'rxjs';

@Pipe({
  name: 'translateSelectItems',
  standalone: true,
})
export class TranslateSelectItemsPipe<T extends SelectItem | MenuItem> implements PipeTransform {
  private translateService = inject(TranslateService);

  public transform(value: T[]): Observable<T[]> {
    return this.translateService.onLangChange.pipe(
      startWith(undefined),
      map((): T[] =>
        value.map(
          (item): T => ({
            ...item,
            label: item.label ? this.translateService.instant(item.label) : undefined,
          }),
        ),
      ),
    );
  }
}
