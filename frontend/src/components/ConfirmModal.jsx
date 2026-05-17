export default function ConfirmModal({ open, title, description, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <div className="pill-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="button ghost" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="button primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
