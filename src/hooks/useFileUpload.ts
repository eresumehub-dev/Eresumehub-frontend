import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const useFileUpload = () => {
    const [file, setFile] = useState<File | null>(null);

    const validateAndSetFile = useCallback((f: File) => {
        if (!ALLOWED_TYPES.includes(f.type)) {
            toast.error('Only PDF and DOCX files are supported.');
            return false;
        }
        if (f.size > MAX_FILE_SIZE) {
            toast.error('File must be under 5MB.');
            return false;
        }
        setFile(f);
        return true;
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) validateAndSetFile(f);
    }, [validateAndSetFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) validateAndSetFile(f);
    }, [validateAndSetFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    return {
        file,
        setFile,
        handleFileChange,
        handleDrop,
        handleDragOver
    };
};
