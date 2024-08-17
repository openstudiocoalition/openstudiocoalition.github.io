import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { TextFieldFormik } from '../fields/TextFieldFormik';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../firebase'
import { enqueueSnackbar } from 'notistack';
import { useNavigate} from 'react-router-dom';
import { useEffect } from 'react';
import { usePageView } from '../ga/usePageView';
import { BASENAME } from '../routes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

type Values = {
  email: string;
};

export const ResetPassword = () => {
  usePageView();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        navigate(`${BASENAME}/releases`);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleBack = () => {
    navigate(-1); // This will navigate back to the previous page
  };

  const onSubmit = async (values: Values) => {
    // call firebase and redirect
    console.log('onSubmit: ', values);

    try {
      const { email } = values;

      const result = await sendPasswordResetEmail(firebaseAuth, email);

      console.log('result: ', result);

      enqueueSnackbar('Check your email for instructions on resetting your password');
    } catch (err) {
      console.log({
        err
      });

      enqueueSnackbar('Error registering user');
    }
  };

  const formikbag = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().required(),
    }),
    validateOnMount: true,
    onSubmit,
  });

  const { handleSubmit } = formikbag;

  return (
    <FormikProvider value={formikbag}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            minWidth: 275,
            maxWidth: 400,
            padding: 2,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton onClick={handleBack} size="small">
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant='h5' component='div'>
                Reset Password
              </Typography>
            </Box>
            <TextFieldFormik
              name={'email'}
              label='Email'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <Button
              variant='contained'
              color='primary'
              sx={{
                marginTop: 2,
                display: 'block',
                width: '100%',
              }}
              onClick={handleSubmit}
            >
              Reset Password
            </Button>
          </CardContent>
        </Card>
      </Box>
    </FormikProvider>
  );
};
