import { useState, useEffect } from 'react';
import { invertAndRemoveBackground } from '../utils/imageProcessor';
import './InvoicePreview.css';

function formatCurrency(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
}

function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
}

export default function InvoicePreview({ invoiceData }) {
    const { buyerName, buyerPhone, buyerAddress, items, invoiceNumber, date, discount, paymentDetails } = invoiceData;
    const [processedLogo, setProcessedLogo] = useState(null);

    useEffect(() => {
        // Process logo: invert (white-on-black → dark-on-white) then remove white bg
        invertAndRemoveBackground('/logo.png', 220).then(setProcessedLogo).catch(console.error);
    }, []);

    const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.amount)), 0);
    const discountAmount = discount ? discount.amount : 0;
    const total = Math.max(0, subtotal - discountAmount);
    const hasDiscount = discount && discountAmount > 0;

    const discountLabel = hasDiscount
        ? (discount.type === 'percent' ? `${discount.value}% Off` : `₦${Number(discount.value).toLocaleString('en-NG')} Off`)
        : '';

    return (
        <div id="invoice-preview" className="invoice-page">
            <div className="invoice-bg-pattern"></div>
            <div className="invoice-content">
                {/* Header */}
                <div className="invoice-header">
                    <div className="invoice-logo-container">
                        {processedLogo ? (
                            <img src={processedLogo} alt="Stepping Soles" className="invoice-logo" />
                        ) : (
                            <img src="/logo.png" alt="Stepping Soles" className="invoice-logo invoice-logo-fallback" />
                        )}
                    </div>
                    <h1 className="invoice-company-name">STEPPING SOLES</h1>
                    <p className="invoice-tagline"><em>Handmade Footwear Crafted for Everyday Comfort</em></p>
                    <p className="invoice-location">LAGOS, NIGERIA</p>
                </div>

                {/* Bill To & Invoice Info */}
                <div className="invoice-info-section">
                    <div className="invoice-bill-to">
                        <p className="invoice-label"><strong>Bill To:</strong></p>
                        <p className="invoice-field">{buyerName || 'Name'}</p>
                        <p className="invoice-field">{buyerPhone || 'Phone'}</p>
                        <p className="invoice-field">{buyerAddress || 'Address'}</p>
                    </div>
                    <div className="invoice-meta">
                        <p>Invoice No: {invoiceNumber}</p>
                        <p>Date: {formatDate(date)}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="invoice-table-container">
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th className="col-num">#</th>
                                <th className="col-item">ITEM</th>
                                <th className="col-qty">QTY</th>
                                <th className="col-amount">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="col-num">{index + 1}</td>
                                    <td className="col-item">{item.name}</td>
                                    <td className="col-qty">{item.qty}</td>
                                    <td className="col-amount">{formatCurrency(item.qty * item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="invoice-totals-section">
                        {hasDiscount && (
                            <div className="invoice-subtotal-row">
                                <span className="invoice-subtotal-label">SUBTOTAL</span>
                                <span className="invoice-subtotal-amount">{formatCurrency(subtotal)}</span>
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="invoice-discount-row">
                                <span className="invoice-discount-label">DISCOUNT ({discountLabel})</span>
                                <span className="invoice-discount-amount">−{formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div className="invoice-total-row">
                            <span className="invoice-total-label">TOTAL</span>
                            <span className="invoice-total-amount">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                {paymentDetails && (paymentDetails.accountNumber || paymentDetails.bankName || paymentDetails.accountName) && (
                    <div className="invoice-payment-details">
                        <p className="invoice-payment-heading">Payment Details</p>
                        <div className="invoice-payment-info">
                            {paymentDetails.bankName && (
                                <p className="invoice-payment-line">
                                    <span className="invoice-payment-key">Bank:</span>
                                    <span className="invoice-payment-value">{paymentDetails.bankName}</span>
                                </p>
                            )}
                            {paymentDetails.accountNumber && (
                                <p className="invoice-payment-line">
                                    <span className="invoice-payment-key">Account No:</span>
                                    <span className="invoice-payment-value">{paymentDetails.accountNumber}</span>
                                </p>
                            )}
                            {paymentDetails.accountName && (
                                <p className="invoice-payment-line">
                                    <span className="invoice-payment-key">Account Name:</span>
                                    <span className="invoice-payment-value">{paymentDetails.accountName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}



                {/* Contact Footer */}
                <div className="invoice-footer">
                    <p className="invoice-footer-heading">Contact</p>
                    <p className="invoice-footer-contact">
                        +234 703 913 9410 &nbsp;&nbsp; Instagram: @stepping.soles
                    </p>
                    <p className="invoice-footer-contact">steppingsoles.com</p>
                </div>

                {/* Thank You */}
                <div className="invoice-thankyou">
                    <p><em>Thank you for your patronage.</em></p>
                </div>
            </div>
        </div>
    );
}
