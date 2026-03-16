"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropClose?: boolean;
  width?: number;
};

export default function Modal({ open, onClose, children, backdropClose = true, width = 400 }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const root = document.getElementById("modal-root");
  if (!root) return null;

  return createPortal(
    <div className="modal-overlay" onClick={backdropClose ? onClose : undefined}>
      <div className="modal-content" style={{ width }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    root
  );
}
