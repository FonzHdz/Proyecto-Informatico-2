import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PopupAlert, PopupAlertProps } from '../components/PopupAlert';

interface AlertContextType {
  showAlert: (options: Omit<PopupAlertProps, 'isOpen'>) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<Omit<PopupAlertProps, 'isOpen'> & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showAlert = (options: Omit<PopupAlertProps, 'isOpen'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({
        ...options,
        isOpen: true,
        onConfirm: () => {
          options.onConfirm?.();
          setAlert(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          options.onCancel?.();
          setAlert(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <PopupAlert {...alert} />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};