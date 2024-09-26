import { Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { type UserValues, userValueDefaults } from './UserValues.type';
import { TextFieldFormik } from '../fields/TextFieldFormik';
import { CountrySelectFormik } from '../fields/CountrySelectFormik';
import { CountryFromLabel } from '../fields/CountrySelect';
import { CheckboxFormik } from '../fields/CheckboxFormik';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import {
  type User,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth, firebaseFirestore } from '../firebase';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { usePageView } from '../ga/usePageView';
import { Header } from '../Header';
import { enqueuePeristentErrorSnackbar } from '../utils/Snackbars'
import { BASENAME } from '../routes';

const getDocument = async (user_uid: string) => {

  let values: UserValues = await getDoc(doc(firebaseFirestore, 'users', user_uid))
  .then((docSnap) => {
    // console.log("Inside the then");
    if (docSnap.exists()) {
      // console.log("docSnap.data()", docSnap.data());
      return {
        ...userValueDefaults,
        ...docSnap.data(),
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log(`No such document: users.${user_uid}`);
      return userValueDefaults;
    }
  })
  .catch((error) => {
    // console.error(`No such document: users.${user_uid}`, error);
    return userValueDefaults;
  });

  // console.log("values", values);
  return values
};


export const Profile = () => {
  usePageView();
  const navigate = useNavigate();

  if (!firebaseAuth.currentUser) {
    return null;
  }
  const user: User = firebaseAuth.currentUser;

  const [initialValues, setInitialValues] = useState<UserValues>(userValueDefaults);
  const [initCountryLabelState, setInitCountryLabelState] = useState(null);
  async function fetchInitialValues() {
     const values = await getDocument(user.uid);
     setInitialValues(values);
     setInitCountryLabelState(CountryFromLabel(values.country));
  }

  useEffect(() => {
    fetchInitialValues()
  }, [])

  const onSubmit = async (values: UserValues) => {
    try {
      const { firstName, lastName, country, company, occupation, email, signMailingList, joinBetaTester } = values;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await updateDoc(doc(firebaseFirestore, 'users', user.uid), {
        firstName,
        lastName,
        email,
        company,
        country,
        occupation,
        signMailingList,
        joinBetaTester,
      });

      enqueueSnackbar('User Profile Updated', { variant: 'success' });

    } catch (error) {
      console.log(error);
      enqueuePeristentErrorSnackbar(`Error Updating user profile: ${error}`);
    }
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteDialogClickOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const onDeleteAccountSubmit = async () => {
    // User deletion will fail if last sign in is too old... And I can't just go ahead and delete it first because I can't delete the doc then.
    // So takes an arbitrary value of 2min since last sign in, and if not, return earliy
    let is_login_recent_enough = false;
    if (user.metadata.lastSignInTime != null) {
      const TWO_MINUTES = 2*60*1000;
      const duration = Date.now() - Date.parse(user.metadata.lastSignInTime);
      if (duration <= TWO_MINUTES) {
        is_login_recent_enough = true;
      }
    }
    if (!is_login_recent_enough) {
      enqueuePeristentErrorSnackbar("Cannot delete user profile because last sign in is too old. Sign out and in again please");
      return;
    }

    await deleteDoc(doc(firebaseFirestore, 'users', user.uid));
    enqueueSnackbar('User Information Deleted', { variant: 'success' });
    //await deleteUser(user);
    user.delete().then(() => {
      enqueueSnackbar('User Deleted', { variant: 'success' });
      navigate(BASENAME);
    }).catch((error) => {
      enqueuePeristentErrorSnackbar(`Error Deleting user profile: ${error}`);
    });
    // user.delete();
  };

  const formikbag = useFormik({
    initialValues: initialValues,
    validationSchema: yup.object().shape({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      country: yup.string().required(),
      company: yup.string(),
      occupation: yup.string(),
      signMailingList: yup.boolean(),
      joinBetaTester: yup.boolean(),
    }),
    validateOnMount: true,
    onSubmit,
    enableReinitialize: true,
  });

  const { handleSubmit, setFieldValue } = formikbag;

  return (
   <>
    <Header />
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
             Profile Information
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
            <CountrySelectFormik
              name={'country'}
              label='Country'
              variant='outlined'
              fullWidth
              margin='normal'
              initCountryLabelState={initCountryLabelState}
              setInitCountryLabelState={setInitCountryLabelState}
            />
            <TextFieldFormik
              name={'occupation'}
              label='Occupation'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'company'}
              label='Company'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <TextFieldFormik
              name={'email'}
              disabled
              label='Email'
              variant='outlined'
              fullWidth
              margin='normal'
            />
            <CheckboxFormik
              name={'signMailingList'}
              label='Sign up for the OSC Mailing list'
              margin='normal'
            />
            <CheckboxFormik
              name={'joinBetaTester'}
              label='Accept to be contacted for beta testing Release Candidates and New Features'
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
              Update Profile
            </Button>
            <Button
              variant='contained'
              color='error'
              sx={{
                marginTop: 2,
                display: 'block',
                width: '100%',
              }}
              onClick={handleDeleteDialogClickOpen}
            >
              Delete My Account
            </Button>
            <Dialog
              open={openDeleteDialog}
              onClose={handleDeleteDialogClose}
              aria-labelledby="delete-account-dialog-title"
              aria-describedby="delete-account-dialog-description"
            >
              <DialogTitle id="delete-account-dialog-title">
                {"Delete your account?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-account-dialog-description">
                  This is a destructive action, your account will not be recoverable.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteDialogClose} autoFocus>Abort</Button>
                <Button onClick={onDeleteAccountSubmit} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Box>
    </FormikProvider>
  </>
  );
};
