import { enqueueSnackbar, closeSnackbar, type SnackbarKey } from 'notistack'

export const dismissSnackBarAction = (snackbarId: SnackbarKey | undefined) => (
    <>
    <button onClick={() => { closeSnackbar(snackbarId) }}>
    Dismiss
    </button>
    </>
);

export const enqueuePeristentErrorSnackbar = (
    message: string
): SnackbarKey => {
    return enqueueSnackbar(message, {action: dismissSnackBarAction, variant: 'error', persist: true});
};
