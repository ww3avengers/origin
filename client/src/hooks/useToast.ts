import * as React from 'react';

// Fallback-Implementierung, falls @radix-ui/react-toast nicht verfügbar ist
type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToast = () => {
  const showToast = React.useCallback((options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 5000 } = options;
    
    // Loggen der Toast-Nachricht in der Konsole als Fallback
    const style = `
      padding: 8px 12px;
      border-radius: 4px;
      color: white;
      background: ${variant === 'destructive' ? '#ef4444' : variant === 'success' ? '#10b981' : '#3b82f6'};
      max-width: 320px;
      margin: 8px;
    `;
    
    console.log(`%c${title}`, style);
    if (description) {
      console.log(`%c${description}`, 'color: #6b7280; margin-left: 8px;');
    }
    
    // Falls Toast-Container existiert, füge eine Nachricht hinzu
    if (typeof document !== 'undefined') {
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
      }
      
      const toastElement = document.createElement('div');
      toastElement.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 8px;
        border-radius: 6px;
        background: ${variant === 'destructive' ? '#ef4444' : variant === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        max-width: 320px;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;
      
      toastElement.innerHTML = `
        <div style="font-weight: 500; margin-bottom: ${description ? '4px' : '0'}">${title}</div>
        ${description ? `<div style="font-size: 0.875rem; opacity: 0.9">${description}</div>` : ''}
      `;
      
      toastContainer.appendChild(toastElement);
      
      // Animation einblenden
      setTimeout(() => {
        toastElement.style.opacity = '1';
        toastElement.style.transform = 'translateX(0)';
      }, 10);
      
      // Nach Ablauf der Dauer ausblenden und entfernen
      setTimeout(() => {
        toastElement.style.opacity = '0';
        toastElement.style.transform = 'translateX(100%)';
        
        // Element nach der Animation entfernen
        setTimeout(() => {
          toastElement.remove();
          
          // Container entfernen, wenn keine Toasts mehr vorhanden sind
          if (toastContainer && toastContainer.children.length === 0) {
            toastContainer.remove();
          }
        }, 300);
      }, Math.max(3000, duration));
    }
  }, []);

  return { toast: showToast };
};
