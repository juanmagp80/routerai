import toast from 'react-hot-toast';

// Función simple para mostrar confirmación - usaremos un estado en el componente
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Por ahora usaremos el confirm nativo pero con mejor UX
    const result = window.confirm(`${title}\n\n${message}`);
    if (result) {
      Promise.resolve(onConfirm()).then(() => {
        resolve(true);
      }).catch((error) => {
        console.error('Confirmation action failed:', error);
        toast.error('Action failed');
        resolve(false);
      });
    } else {
      resolve(false);
    }
  });
};

// Funciones helper para diferentes tipos de notificaciones
export const showSuccess = (message: string, duration?: number) => {
  toast.success(message, { duration });
};

export const showError = (message: string, duration?: number) => {
  toast.error(message, { duration });
};

export const showInfo = (message: string, duration?: number) => {
  toast(message, { 
    icon: 'ℹ️',
    duration,
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  });
};

export const showWarning = (message: string, duration?: number) => {
  toast(message, {
    icon: '⚠️',
    duration,
    style: {
      background: '#F59E0B',
      color: '#fff',
    },
  });
};

// Notificación de loading
export const showLoading = (message: string) => {
  return toast.loading(message);
};

// Promesa con toast
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};