import { FormArray } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { OperatorFunction, shareReplay } from 'rxjs';

export function moveControlInFormArray(formArray: FormArray, previousIndex: number, currentIndex: number): void {
  const dir = currentIndex > previousIndex ? 1 : -1;

  const temp = formArray.at(previousIndex);
  for (let i = previousIndex; i * dir < currentIndex * dir; i += dir) {
    const current = formArray.at(i + dir);
    formArray.setControl(i, current);
  }
  formArray.setControl(currentIndex, temp);
  formArray.markAsDirty();
}

export function moveUpInFormArray(formArray: FormArray, previousIndex: number): void {
  const currentIndex = previousIndex - 1;

  if (currentIndex >= 0) {
    moveControlInFormArray(formArray, previousIndex, currentIndex);
  }
}

export function moveDownInFormArray(formArray: FormArray, previousIndex: number): void {
  const currentIndex = previousIndex + 1;

  if (currentIndex < formArray.length) {
    moveControlInFormArray(formArray, previousIndex, currentIndex);
  }
}

export function shareReplayOne<T>(): OperatorFunction<T, T> {
  return shareReplay({ bufferSize: 1, refCount: true });
}

export class ListRequest {
  public active?: string;
  public direction?: string;
  public pageIndex?: number;
  public pageSize?: number;
  public filter?: string;
  public select?: string;
}

export function toListRequest<T>(conditions: any | undefined, additionalFilters?: Partial<Record<keyof T, any>>, select?: (keyof T)[]): ListRequest {
  if (!conditions && !additionalFilters && !select) {
    return {};
  }

  if (!conditions) {
    return {
      filter: JSON.stringify(additionalFilters),
      select: select?.join(' '),
    };
  }

  const filter: any = {};

  for (const [key, value] of Object.entries<any>(conditions.filters || {})) {
    if (value) {
      if (value.matchMode === 'startsWith' && value.value) {
        filter[key] = { $regex: `^${value.value}`, $options: 'i' };
      }
      if (value.matchMode === 'contains' && value.value) {
        filter[key] = { $regex: `${value.value}`, $options: 'i' };
      }
      if (value.matchMode === 'notContains' && value.value) {
        filter[key] = { $not: { $regex: `${value.value}`, $options: 'i' } };
      }
      if (value.matchMode === 'endsWith' && value.value) {
        filter[key] = { $regex: `${value.value}$`, $options: 'i' };
      }
      if (value.matchMode === 'equals' && value.value) {
        filter[key] = { $eq: value.value };
      }
      if (value.matchMode === 'notEquals' && value.value) {
        filter[key] = { $ne: value.value };
      }
      if (value.matchMode === 'in' && value.value && value.value.length > 0) {
        filter[key] = { $in: value.value };
      }
    }
  }

  return {
    active: conditions.sortField,
    direction: conditions.sortOrder === -1 ? 'asc' : 'desc',
    pageIndex: conditions.first / conditions.rows,
    pageSize: conditions.rows,
    filter: JSON.stringify({ ...filter, ...(additionalFilters || {}) }),
    select: select?.join(' '),
  };
}

export function toSelectItems(name: string, type: any): SelectItem<string>[] {
  return Object.values<any>(type).map((value) => ({ label: `enums.${name}.${value}`, value }));
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHJKLMNRSTUYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
