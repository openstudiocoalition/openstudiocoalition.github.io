import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { TextFieldFormik } from '../fields/TextFieldFormik';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GithubAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  type User,
  type AuthCredential
} from 'firebase/auth';
import { firebaseAuth, firebaseFirestore, githubProvider } from '../firebase';
import { enqueueSnackbar } from 'notistack';
import {Link, useNavigate} from 'react-router-dom';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { usePageView } from '../ga/usePageView';
import { gaLoginEvent } from '../ga/gaEvents';
import { BASENAME } from '../routes';
import { FaGithub } from 'react-icons/fa';

type Values = {
  firstName: string;
  lastName: string;
  country: string;
  company: string;
  occupation: string;
  email: string;
  password: string;
};

export const Register = () => {
  usePageView();
  const navigate = useNavigate();
  const [pendingCredentials, setPendingCredentials] =
    useState<AuthCredential>();
  const [currentUser, setUser] = useState<User>();

  const onSubmit = async (values: Values) => {
    try {
      const { firstName, lastName, country, company, occupation, email, password } = values;

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

      gaLoginEvent(userCredential.user.uid);

      const { user } = userCredential;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(firebaseFirestore, 'users', user.uid), {
        firstName,
        lastName,
        email,
        company,
        country,
        occupation,
      });

      navigate(`${BASENAME}/releases`);

    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error registering user');
    }
  };

  const formikbag = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      country: '',
      company: '',
      occupation: '',
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().required(),
      password: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      country: yup.string(),
      company: yup.string(),
      occupation: yup.string(),
    }),
    validateOnMount: true,
    onSubmit,
  });

  const { handleSubmit, setFieldValue } = formikbag;

  const handleGithubRegister = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, githubProvider);

      const credential = GithubAuthProvider.credentialFromResult(result)

      setUser(result.user);
      setPendingCredentials(credential);

      const names = result.user.displayName.split(' ');
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";
      const email = result.user.email || "";

      await setDoc(doc(firebaseFirestore, 'users', result.user.uid), {
        firstName,
        lastName,
        email,
      });

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
  }

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
              Register
            </Typography>
            <TextFieldFormik
              name={'firstName'}
              label='First Name'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'lastName'}
              label='Last Name'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'country'}
              label='Country'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'occupation'}
              label='Occupation'
              variant='outlined'
              fullWidth
              margin='normal'
            />
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
              Register
            </Button>
            <Typography variant='body2' align='center' sx={{ marginTop: 2 }}>
              Have an account? <Link to={`${BASENAME}/login`}>Login</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </FormikProvider>
  );
};
