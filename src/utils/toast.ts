import { toast } from 'sonner';

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    duration: 3000,
    position: 'top-center',
  });
};
