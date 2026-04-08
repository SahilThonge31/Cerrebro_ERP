const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;

const generateReceipt = (transaction, student, callback) => {
    // 1. Initialize PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // 2. 🚨 THE FIX: Stream directly to Cloudinary instead of local disk!
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'school_app/fee_receipts',
            public_id: `Receipt-${transaction.transactionId}`,
            resource_type: 'raw', // 'raw' is required for PDFs
            format: 'pdf'
        },
        (error, result) => {
            if (error) {
                console.error("Cloudinary PDF Upload Error:", error);
                return callback(null);
            }
            // Send the secure Cloudinary URL back to the controller
            callback(result.secure_url); 
        }
    );

    // Pipe the PDF directly into the Cloudinary upload stream
    doc.pipe(uploadStream);

    // ==========================================
    // 🎨 PDF DESIGN & CONTENT
    // ==========================================

    // --- A. BACKGROUND WATERMARK ---
    doc.save()
       .translate(120, 500) // Position in the middle-ish
       .rotate(-45) // Diagonal angle
       .fontSize(90)
       .fillColor('#f1f5f9') // Very light, subtle gray
       .font('Helvetica-Bold')
       .text('CERREBRO', 0, 0, { opacity: 0.1 }) // Low opacity
       .restore();

    // --- B. HEADER & COMPANY INFO ---
    const brandColor = '#0f766e'; // Professional Teal
    const darkText = '#1e293b';
    const lightText = '#64748b';

    doc.fontSize(28).fillColor(brandColor).font('Helvetica-Bold').text('CERREBRO TUTORIALS', 50, 45, { align: 'center', characterSpacing: 1 });
    doc.fontSize(10).fillColor(lightText).font('Helvetica').text('123, Excellence Plaza, Main Road, Pune - 411001', { align: 'center' });
    doc.text('Email: admin@cerrebro.com  |  Phone: +91-9876543210  |  Web: www.cerrebro.com', { align: 'center' });
    doc.moveDown();
    
    // Header Divider
    doc.strokeColor('#cbd5e1').lineWidth(1.5).moveTo(50, 115).lineTo(545, 115).stroke();

    // --- C. RECEIPT TITLE & PAID STAMP ---
    doc.moveDown(1.5);
    doc.fontSize(16).fillColor(darkText).font('Helvetica-Bold').text('FEE PAYMENT RECEIPT', { align: 'left' });
    
    // "PAID" Stamp in the top right
    doc.rect(480, 130, 65, 25).fillAndStroke('#ecfdf5', '#10b981');
    doc.fontSize(12).fillColor('#10b981').font('Helvetica-Bold').text('PAID', 480, 136, { width: 65, align: 'center' });

    // --- D. META DATA (Student & Transaction details inside a light box) ---
    const boxTop = 170;
    doc.rect(50, boxTop, 495, 80).fill('#f8fafc').stroke('#e2e8f0'); // Light background box
    
    // Left Column: Student Details
    doc.fontSize(10).font('Helvetica-Bold').fillColor(brandColor).text('STUDENT DETAILS', 65, boxTop + 10);
    doc.font('Helvetica-Bold').fillColor(darkText).text('Name:', 65, boxTop + 30);
    doc.font('Helvetica').fillColor(lightText).text(student.name, 110, boxTop + 30);
    
    doc.font('Helvetica-Bold').fillColor(darkText).text('Class:', 65, boxTop + 45);
    doc.font('Helvetica').fillColor(lightText).text(`${student.standard} (${student.board})`, 110, boxTop + 45);
    
    doc.font('Helvetica-Bold').fillColor(darkText).text('Roll No:', 65, boxTop + 60);
    doc.font('Helvetica').fillColor(lightText).text(student.rollNumber || 'N/A', 110, boxTop + 60);

    // Vertical Divider Line
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(297, boxTop + 10).lineTo(297, boxTop + 70).stroke();

    // Right Column: Transaction Details
    doc.fontSize(10).font('Helvetica-Bold').fillColor(brandColor).text('TRANSACTION DETAILS', 315, boxTop + 10);
    doc.font('Helvetica-Bold').fillColor(darkText).text('Receipt No:', 315, boxTop + 30);
    doc.font('Helvetica').fillColor(lightText).text(transaction.transactionId, 390, boxTop + 30);
    
    doc.font('Helvetica-Bold').fillColor(darkText).text('Date:', 315, boxTop + 45);
    doc.font('Helvetica').fillColor(lightText).text(new Date(transaction.date).toLocaleDateString('en-IN'), 390, boxTop + 45);
    
    doc.font('Helvetica-Bold').fillColor(darkText).text('Mode:', 315, boxTop + 60);
    doc.font('Helvetica').fillColor(lightText).text(transaction.paymentMode, 390, boxTop + 60);

    // --- E. PAYMENT TABLE ---
    const tableTop = 280;
    
    // Table Header
    doc.rect(50, tableTop, 495, 30).fill(brandColor); // Teal Header
    doc.fillColor('#ffffff').font('Helvetica-Bold').text('DESCRIPTION', 65, tableTop + 10);
    doc.text('AMOUNT (INR)', 430, tableTop + 10, { width: 100, align: 'right' });

    // Table Row
    doc.rect(50, tableTop + 30, 495, 40).fill('#ffffff').stroke('#e2e8f0');
    doc.fillColor(darkText).font('Helvetica').text(`${transaction.type} Fee Payment for Academic Year`, 65, tableTop + 45);
    doc.font('Helvetica-Bold').text(`Rs. ${transaction.amount.toLocaleString('en-IN')}.00`, 430, tableTop + 45, { width: 100, align: 'right' });
    
    // Total Section
    doc.rect(50, tableTop + 70, 495, 35).fill('#f1f5f9').stroke('#e2e8f0');
    doc.fillColor(darkText).font('Helvetica-Bold').text('TOTAL AMOUNT PAID:', 280, tableTop + 82);
    doc.fontSize(14).fillColor('#16a34a').text(`Rs. ${transaction.amount.toLocaleString('en-IN')}.00`, 430, tableTop + 80, { width: 100, align: 'right' });

    // --- F. FOOTER & SIGNATURE ---
    const signatureY = 600;
    
    // Terms / Note
    doc.fontSize(9).fillColor(darkText).font('Helvetica-Bold').text('Important Notes:', 50, 520);
    doc.font('Helvetica').fillColor(lightText)
       .text('1. Fees once paid are strictly non-refundable and non-transferable.', 50, 535)
       .text('2. Please keep this receipt safe for future reference.', 50, 550);

    // Signature Area
    doc.strokeColor('#94a3b8').lineWidth(1).moveTo(390, signatureY).lineTo(520, signatureY).stroke();
    doc.fontSize(10).fillColor(darkText).font('Helvetica-Bold').text('For Cerrebro Tutorials', 390, signatureY + 10, { width: 130, align: 'center' });
    doc.font('Helvetica-Oblique').fillColor(lightText).text('Authorized Signatory', 390, signatureY + 25, { width: 130, align: 'center' });

    // Bottom Computer Generated Note
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text('This is a computer-generated receipt and does not require a physical signature.', 50, 750, { align: 'center' });

    // 3. Finalize the PDF
    // Calling doc.end() finishes the document and triggers the Cloudinary uploadStream to complete!
    doc.end();
};

module.exports = generateReceipt;