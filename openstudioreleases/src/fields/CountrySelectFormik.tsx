import { useField } from 'formik';
import {CountrySelect} from './CountrySelect';

export const CountrySelectFormik = ({ label, ...props }) => {
  const [field, meta, helpers] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : '';

  return (
    <CountrySelect
      {...field}
      {...props}
      label={label}
      helperText={errorText}
      error={!!errorText}
      setValue={helpers.setValue}
    />
  );
};
