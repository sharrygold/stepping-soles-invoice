import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

export async function generatePDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Invoice element not found');
    }

    const opt = {
        margin: 0,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#f5f1ed',
            width: 595,
            height: 842,
        },
        jsPDF: {
            unit: 'px',
            format: [595, 842],
            orientation: 'portrait',
            hotfixes: ['px_scaling'],
        },
    };

    await html2pdf().set(opt).from(element).save();
}

export async function generateImage(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Invoice element not found');
    }

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#f5f1ed',
        width: 595,
        height: 842,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
