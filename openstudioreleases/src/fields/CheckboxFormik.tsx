import { useField } from 'formik';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';

export const CheckboxFormik = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : '';

  return (
    <FormControlLabel control={<Checkbox
      {...field}
      {...props}
      checked={field.value}
    />} label={<Typography sx={{ fontSize: 10 }}>{label}</Typography>} />
  );
};
