"use client";

import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open, title, message,
  confirmLabel = "확인", cancelLabel = "취소",
  danger = false, onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} width={400}>
      <h2 className="modal-title">{title}</h2>
      <p className="modal-body">{message}</p>
      <div className="modal-actions">
        <button onClick={onCancel} className="btn btn-secondary">{cancelLabel}</button>
        <button onClick={onConfirm} className={`btn ${danger ? "btn-danger" : "btn-primary"}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
