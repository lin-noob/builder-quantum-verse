import React, { createContext, useContext, useState, ReactNode } from "react";

interface ContactModalContextType {
  isOpen: boolean;
  openModal: (options?: ContactModalOptions) => void;
  closeModal: () => void;
  modalTitle: string;
  modalDescription: string;
}

interface ContactModalOptions {
  title?: string;
  description?: string;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

interface ContactModalProviderProps {
  children: ReactNode;
}

export const ContactModalProvider: React.FC<ContactModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("联系我们");
  const [modalDescription, setModalDescription] = useState("请填写您的信息和需求，我们将尽快与您联系");

  const openModal = (options?: ContactModalOptions) => {
    if (options?.title) {
      setModalTitle(options.title);
    }
    if (options?.description) {
      setModalDescription(options.description);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // 重置为默认值
    setTimeout(() => {
      setModalTitle("联系我们");
      setModalDescription("请填写您的信息和需求，我们将尽快与您联系");
    }, 200); // 延迟重置，等待动画结束
  };

  const value: ContactModalContextType = {
    isOpen,
    openModal,
    closeModal,
    modalTitle,
    modalDescription,
  };

  return (
    <ContactModalContext.Provider value={value}>
      {children}
    </ContactModalContext.Provider>
  );
};

export const useContactModal = (): ContactModalContextType => {
  const context = useContext(ContactModalContext);
  if (context === undefined) {
    throw new Error("useContactModal must be used within a ContactModalProvider");
  }
  return context;
};
