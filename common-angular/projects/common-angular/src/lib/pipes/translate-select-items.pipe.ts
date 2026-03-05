import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { map, Observable, startWith } from 'rxjs';

@Pipe({
  name: 'translateSelectItems',
  standalone: true,
})
export class TranslateSelectItemsPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  public transform(value: SelectItem[]): Observable<SelectItem[]> {
    return this.translateService.onLangChange.pipe(
      startWith(this.translateService.currentLang),
      map((): SelectItem[] =>
        value.map((item) => ({
          label: this.translateService.instant(item.label!),
          value: item.value,
        })),
      ),
    );
  }
}
