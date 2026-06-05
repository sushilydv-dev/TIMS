import React, { createContext, useContext, useState, useCallback } from "react";
import { Consulatation } from "../components/Consulatation";

const ConsultationContext = createContext(null);

export const ConsultationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openConsultation = useCallback(() => setIsOpen(true), []);
  const closeConsultation = useCallback(() => setIsOpen(false), []);

  return (
    <ConsultationContext.Provider
      value={{ isOpen, openConsultation, closeConsultation }}
    >
      {children}
      <Consulatation open={isOpen} onClose={closeConsultation} />
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error("useConsultation must be used within ConsultationProvider");
  }
  return context;
};
