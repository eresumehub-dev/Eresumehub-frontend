import { useState, useCallback } from 'react';

export const useConfirmModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

    const confirmAction = useCallback((title: string, message: string, action: () => void) => {
        setTitle(title);
        setMessage(message);
        setOnConfirm(() => action);
        setIsOpen(true);
    }, []);

    const close = () => {
        setIsOpen(false);
        setOnConfirm(null);
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        close();
    };

    return {
        isOpen,
        title,
        message,
        confirmAction,
        close,
        handleConfirm
    };
};
