"use client";

import { Toaster } from "react-hot-toast";

export const ToasterProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          background: '#020617', 
          color: '#e2e8f0', 
          border: '1px solid #1e293b', 
          borderRadius: '4px', 
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', 
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          maxWidth: '400px',
        },
        
        success: {
          iconTheme: {
            primary: '#10b981', 
            secondary: '#020617', 
          },
          style: {
            borderLeft: '4px solid #10b981', 
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(2, 6, 23, 1))',
          },
        },

        error: {
          iconTheme: {
            primary: '#ef4444', 
            secondary: '#020617', 
          },
          style: {
            borderLeft: '4px solid #ef4444', 
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), rgba(2, 6, 23, 1))', 
          },
        },

        loading: {
          style: {
             borderLeft: '4px solid #f59e0b', 
             background: '#020617',
          }
        }
      }}
    />
  );
};