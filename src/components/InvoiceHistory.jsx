import './InvoiceHistory.css';

function formatCurrency(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function InvoiceHistory({ invoices, onView, onViewImage, onDelete }) {
    if (invoices.length === 0) {
        return (
            <div className="history-container">
                <h2>Invoice History</h2>
                <div className="history-empty">
                    <div className="history-empty-icon">📋</div>
                    <p>No invoices generated yet.</p>
                    <p className="history-empty-sub">Create your first invoice to see it here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <h2>Invoice History</h2>
            <p className="history-count">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} generated</p>
            <div className="history-list">
                {[...invoices].reverse().map((invoice) => {
                    const total = invoice.items.reduce(
                        (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.amount) || 0),
                        0
                    );
                    return (
                        <div className="history-card" key={invoice.id}>
                            <div className="history-card-main">
                                <div className="history-card-info">
                                    <span className="history-invoice-number">{invoice.invoiceNumber}</span>
                                    <span className="history-buyer-name">{invoice.buyerName}</span>
                                </div>
                                <div className="history-card-meta">
                                    <span className="history-date">{formatDate(invoice.date)}</span>
                                    <span className="history-amount">{formatCurrency(total)}</span>
                                </div>
                            </div>
                            <div className="history-card-actions">
                                <button className="history-view-btn" onClick={() => onView(invoice)}>
                                    Download PDF
                                </button>
                                <button className="history-image-btn" onClick={() => onViewImage(invoice)}>
                                    Save as Image
                                </button>
                                <button className="history-delete-btn" onClick={() => onDelete(invoice.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
