export interface UserValues {
  firstName: string;
  lastName: string;
  country: string;
  company: string;
  occupation: string;
  email: string;
  password: string;
  signMailingList: boolean;
  joinBetaTester: boolean;
};

export const userValueDefaults = {
    firstName: '',
    lastName: '',
    country: '',
    company: '',
    occupation: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    signMailingList: true,
    joinBetaTester: true,
};
