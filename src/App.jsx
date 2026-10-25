import { useState, useRef } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import InvoiceHistory from './components/InvoiceHistory';
import {
  peekNextInvoiceNumber,
  updateInvoiceCounter,
  saveInvoice,
  getInvoices,
  deleteInvoice,
} from './utils/invoiceStorage';
import { generatePDF, generateImage } from './utils/pdfGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [invoiceNumber, setInvoiceNumber] = useState(peekNextInvoiceNumber());
  const [invoices, setInvoices] = useState(getInvoices());
  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState('pdf');
  const previewRef = useRef(null);

  const handleGenerate = async (formData, format = 'pdf') => {
    const invNum = formData.invoiceNumber;
    updateInvoiceCounter(invNum);
    const invoiceData = {
      ...formData,
    };

    setPreviewData(invoiceData);
    setIsGenerating(true);
    setGeneratingType(format);

    // Wait for React to render the preview
    setTimeout(async () => {
      try {
        const filename = `Stepping_Soles_${invNum}`;
        if (format === 'image') {
          await generateImage('invoice-preview', filename);
        } else {
          await generatePDF('invoice-preview', filename);
        }
        saveInvoice(invoiceData);
        setInvoices(getInvoices());
        setInvoiceNumber(peekNextInvoiceNumber());
      } catch (err) {
        console.error(`${format} generation failed:`, err);
        alert(`Failed to generate ${format}. Please try again.`);
      } finally {
        setIsGenerating(false);
        setPreviewData(null);
      }
    }, 1000);
  };

  const handleGenerateImage = (formData) => {
    handleGenerate(formData, 'image');
  };

  const handleViewInvoice = async (invoice, format = 'pdf') => {
    setPreviewData(invoice);
    setIsGenerating(true);
    setGeneratingType(format);

    setTimeout(async () => {
      try {
        const filename = `Stepping_Soles_${invoice.invoiceNumber}`;
        if (format === 'image') {
          await generateImage('invoice-preview', filename);
        } else {
          await generatePDF('invoice-preview', filename);
        }
      } catch (err) {
        console.error(`${format} generation failed:`, err);
        alert(`Failed to generate ${format}. Please try again.`);
      } finally {
        setIsGenerating(false);
        setPreviewData(null);
      }
    }, 1000);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoices(getInvoices());
    }
  };

  return (
    <div className="app">
      {/* Nav */}
      <nav className="app-nav">
        <div className="app-nav-brand">
          <img src="/logo.png" alt="Stepping Soles" className="app-nav-logo" />
          <span className="app-nav-title">Stepping Soles</span>
        </div>
        <div className="app-nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Invoice
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
            {invoices.length > 0 && (
              <span className="nav-badge">{invoices.length}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="app-main">
        {activeTab === 'create' ? (
          <InvoiceForm
            initialInvoiceNumber={invoiceNumber}
            onGenerate={(data) => handleGenerate(data, 'pdf')}
            onGenerateImage={handleGenerateImage}
          />
        ) : (
          <InvoiceHistory
            invoices={invoices}
            onView={(inv) => handleViewInvoice(inv, 'pdf')}
            onViewImage={(inv) => handleViewInvoice(inv, 'image')}
            onDelete={handleDeleteInvoice}
          />
        )}
      </main>

      {/* Hidden Invoice Preview for PDF/Image Generation */}
      {previewData && (
        <div className="invoice-render-area" ref={previewRef}>
          <InvoicePreview invoiceData={previewData} />
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="generating-overlay">
          <div className="generating-spinner"></div>
          <p>Generating invoice {generatingType === 'image' ? 'image' : 'PDF'}...</p>
        </div>
      )}
    </div>
  );
}

export default App;
