'use client';

import { createPortal } from "react-dom";
import LoginForm from "../login/LoginForm";

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginPortal({ isOpen, onClose, onLoginSuccess }: LoginPortalProps) {
  if (!isOpen) return null;

  return createPortal(
    <LoginForm onClose={onClose} onLoginSuccess={onLoginSuccess} />,
    document.body
  );
}