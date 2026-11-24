import { useState, useEffect } from 'react';
import { getPaymentDetails, savePaymentDetails } from '../utils/invoiceStorage';
import './InvoiceForm.css';

export default function InvoiceForm({ initialInvoiceNumber, onGenerate, onGenerateImage }) {
    const [invoiceNumber, setInvoiceNumber] = useState(initialInvoiceNumber);
    const [buyerName, setBuyerName] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [buyerAddress, setBuyerAddress] = useState('');
    const [items, setItems] = useState([{ name: '', qty: 1, amount: '' }]);
    const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'fixed'
    const [discountValue, setDiscountValue] = useState('');
    const [accountNumber, setAccountNumber] = useState(() => getPaymentDetails().accountNumber);
    const [bankName, setBankName] = useState(() => getPaymentDetails().bankName);
    const [accountName, setAccountName] = useState(() => getPaymentDetails().accountName);

    useEffect(() => {
        setInvoiceNumber(initialInvoiceNumber);
    }, [initialInvoiceNumber]);

    const addItem = () => {
        setItems([...items, { name: '', qty: 1, amount: '' }]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updated = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setItems(updated);
    };

    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.amount) || 0),
        0
    );

    const discountAmount = discountType === 'percent'
        ? subtotal * ((Number(discountValue) || 0) / 100)
        : (Number(discountValue) || 0);

    const total = Math.max(0, subtotal - discountAmount);
    const hasDiscount = (Number(discountValue) || 0) > 0;

    const isValid = buyerName.trim() && items.some((item) => item.name.trim() && item.amount);

    const buildFormData = () => ({
        invoiceNumber: invoiceNumber.trim(),
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerAddress: buyerAddress.trim(),
        items: items.filter((item) => item.name.trim() && item.amount),
        date: new Date().toISOString(),
        discount: hasDiscount ? {
            type: discountType,
            value: Number(discountValue),
            amount: discountAmount,
        } : null,
        paymentDetails: {
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim(),
            accountName: accountName.trim(),
        },
    });

    const handleGenerate = () => {
        if (!isValid) return;
        const data = buildFormData();
        savePaymentDetails(data.paymentDetails);
        onGenerate(data);
    };

    const handleGenerateImg = () => {
        if (!isValid) return;
        const data = buildFormData();
        savePaymentDetails(data.paymentDetails);
        onGenerateImage(data);
    };

    const handleReset = () => {
        const saved = getPaymentDetails();
        setInvoiceNumber(initialInvoiceNumber);
        setBuyerName('');
        setBuyerPhone('');
        setBuyerAddress('');
        setItems([{ name: '', qty: 1, amount: '' }]);
        setDiscountType('percent');
        setDiscountValue('');
        setAccountNumber(saved.accountNumber);
        setBankName(saved.bankName);
        setAccountName(saved.accountName);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>Create Invoice</h2>
                <input
                    type="text"
                    className="form-invoice-number-input"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-0000"
                />
            </div>

            <div className="form-section">
                <h3>Buyer Information</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="buyerName">Name *</label>
                        <input
                            id="buyerName"
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Enter buyer's name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="buyerPhone">Phone</label>
                        <input
                            id="buyerPhone"
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="buyerAddress">Address</label>
                        <input
                            id="buyerAddress"
                            type="text"
                            value={buyerAddress}
                            onChange={(e) => setBuyerAddress(e.target.value)}
                            placeholder="Enter buyer's address"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Items</h3>
                <div className="items-table">
                    <div className="items-header">
                        <span className="item-col-name">Item Name</span>
                        <span className="item-col-qty">Qty</span>
                        <span className="item-col-amount">Unit Price (₦)</span>
                        <span className="item-col-line">Line Total</span>
                        <span className="item-col-action"></span>
                    </div>
                    {items.map((item, index) => (
                        <div className="items-row" key={index}>
                            <input
                                className="item-col-name"
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                placeholder="e.g. Handmade Leather Loafers"
                            />
                            <input
                                className="item-col-qty"
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                            />
                            <input
                                className="item-col-amount"
                                type="number"
                                min="0"
                                value={item.amount}
                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                placeholder="0"
                            />
                            <span className="item-col-line">
                                ₦{((Number(item.qty) || 0) * (Number(item.amount) || 0)).toLocaleString('en-NG')}
                            </span>
                            <button
                                className="item-remove-btn"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                title="Remove item"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <button className="add-item-btn" onClick={addItem}>
                    + Add Item
                </button>

                {/* Discount */}
                <div className="discount-section">
                    <div className="discount-row">
                        <label className="discount-label">Discount</label>
                        <div className="discount-controls">
                            <select
                                className="discount-type-select"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                            >
                                <option value="percent">%</option>
                                <option value="fixed">₦</option>
                            </select>
                            <input
                                className="discount-input"
                                type="number"
                                min="0"
                                max={discountType === 'percent' ? 100 : subtotal}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        {hasDiscount && (
                            <span className="discount-preview">
                                −₦{discountAmount.toLocaleString('en-NG')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Totals */}
                <div className="form-totals">
                    {hasDiscount && (
                        <div className="form-subtotal">
                            <span>Subtotal:</span>
                            <span>₦{subtotal.toLocaleString('en-NG')}</span>
                        </div>
                    )}
                    {hasDiscount && (
                        <div className="form-discount-line">
                            <span>Discount ({discountType === 'percent' ? `${discountValue}%` : `₦${Number(discountValue).toLocaleString('en-NG')}`}):</span>
                            <span className="form-discount-amount">−₦{discountAmount.toLocaleString('en-NG')}</span>
                        </div>
                    )}
                    <div className="form-total">
                        <span>Total:</span>
                        <span className="form-total-amount">₦{total.toLocaleString('en-NG')}</span>
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Payment Details</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="accountNumber">Account Number</label>
                        <input
                            id="accountNumber"
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Enter account number"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bankName">Bank Name</label>
                        <input
                            id="bankName"
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Enter bank name"
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="accountName">Account Name</label>
                        <input
                            id="accountName"
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Enter account name"
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-secondary" onClick={handleReset}>
                    Clear Form
                </button>
                <button className="btn-outline" onClick={handleGenerateImg} disabled={!isValid}>
                    Download as Image
                </button>
                <button className="btn-primary" onClick={handleGenerate} disabled={!isValid}>
                    Download as PDF
                </button>
            </div>
        </div>
    );
}
