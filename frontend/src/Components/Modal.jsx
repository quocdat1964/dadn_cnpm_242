// src/Components/Modal.jsx
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
    const [isContentVisible, setIsContentVisible] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => { setIsContentVisible(true); }, 10);
        } else {
            setIsContentVisible(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen) { return null; }

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(52, 59, 70, 0.65)' }}
            onClick={onClose} aria-modal="true" role="dialog"
        >
            <div
                className={`relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl transform transition-all duration-300 ease-in-out ${isContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">
                    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                    <button
                        onClick={onClose}
                        className="-mr-1.5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                        aria-label="Đóng modal"
                    >
                        <FiX className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-5 md:p-6 text-slate-600"> 
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;