import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { TextFieldFormik } from '../fields/TextFieldFormik';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GithubAuthProvider,
  linkWithCredential,
  type AuthCredential,
} from 'firebase/auth';
import { firebaseAuth, githubProvider } from '../firebase';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageView } from '../ga/usePageView';
import { gaLoginEvent } from '../ga/gaEvents';
import { BASENAME } from '../routes';
import { FaGithub } from 'react-icons/fa';

type Values = {
  email: string;
  password: string;
};

export const Login = () => {
  usePageView();
  const navigate = useNavigate();
  const [pendingCredentials, setPendingCredentials] =
    useState<AuthCredential>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        navigate(`${BASENAME}/releases`);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, githubProvider);

      gaLoginEvent(result.user.uid);

      navigate(`${BASENAME}/releases`);
    } catch (error) {

      console.log(error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        const credential = GithubAuthProvider.credentialFromError(error);

        setPendingCredentials(credential);

        enqueueSnackbar(
          'You already login using email and password, login with email and password to link github login',
        );

        navigate(`${BASENAME}/login`);
        return;
      }

      enqueueSnackbar('Error registering user');
    }
  };

  const onSubmit = async (values: Values) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        values.email,
        values.password,
      );

      gaLoginEvent(userCredential.user.uid);

      if (pendingCredentials) {
        await linkWithCredential(
          userCredential.user,
          pendingCredentials,
        );
      }

      navigate(`${BASENAME}/releases`);
    } catch (error) {
      console.log(error);
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
              Forget your password?{' '}
              <Link to={`${BASENAME}/reset-password`}>Reset Password</Link>
            </Typography>
            <Typography variant='body2' align='center' sx={{ marginTop: 2 }}>
              Don't have an account?{' '}
              <Link to={`${BASENAME}/register`}>Register</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </FormikProvider>
  );
};
