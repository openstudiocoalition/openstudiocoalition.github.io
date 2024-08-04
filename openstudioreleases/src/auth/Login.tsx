import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { TextFieldFormik } from '../fields/TextFieldFormik';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth} from '../firebase'
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageView } from '../ga/usePageView';
import { gaLoginEvent } from '../ga/gaEvents';
import { BASENAME } from '../routes';

type Values = {
  email: string;
  password: string;
};

export const Login = () => {
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

  const onSubmit = async (values: Values) => {
    // call firebase and redirect
    console.log('onSubmit: ', values);

    try {
      const userCredential =await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);

      gaLoginEvent(userCredential.user.uid);

      navigate(`${BASENAME}/releases`);
    } catch (err) {
      console.log({
        err
      });

      enqueueSnackbar('Invalid email or password');
    }
  };

  const formikbag = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().required(),
      password: yup.string().required(),
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
            <Typography variant='h5' component='div' gutterBottom>
              Login
            </Typography>
            <TextFieldFormik
              name={'email'}
              label='Email'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'password'}
              label='Password'
              variant='outlined'
              type='password'
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
              Sign In
            </Button>
            <Typography variant='body2' align='center' sx={{ marginTop: 2 }}>
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </FormikProvider>
  );
};
