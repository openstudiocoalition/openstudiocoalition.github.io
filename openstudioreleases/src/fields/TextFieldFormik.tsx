import { useField } from 'formik';
import { TextField } from '@mui/material';

export const TextFieldFormik = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : '';

  return (
    <TextField
      {...field}
      {...props}
      label={label}
      helperText={errorText}
      error={!!errorText}
      variant="outlined"
      fullWidth
      margin="normal"
    />
  );
};
