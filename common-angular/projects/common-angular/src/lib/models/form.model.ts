import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export type FormOf<T, V = unknown> = { [k in keyof Omit<T, keyof V>]: AbstractControl<T[k]> } & V;

export type FormGroupOf<T, V = unknown> = FormGroup<FormOf<T, V>>;

export type FormControlOf<T, V = unknown> = FormControl<FormOf<T, V>>;

export type TypedFormControls<Type> = {
  [k in keyof Type]: FormControl<Type[k]>;
};

export type TypedFormControlsOf<Type> = FormGroup<TypedFormControls<Type>>;

export type TypedFormOf<Type, Types extends { [k in keyof Partial<Type>]: any }> = {
  [k in keyof Omit<Type, keyof Types>]: FormControl<Type[k]>;
} & {
  [k in keyof Types]: Types[k];
};

export type SimpleTypedFormOf<Type> = {
  [k in keyof Type]: FormControl<Type[k]>;
};

export type TypedFormGroupOf<Type, GroupKeys extends { [k in keyof Partial<Type>]: any }> = FormGroup<TypedFormOf<Type, GroupKeys>>;
