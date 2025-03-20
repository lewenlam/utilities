import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { PDFDocument } from 'pdf-lib';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import docxPdf from 'docx2pdf-converter';
import cliProgress from 'cli-progress'; // Import the progress bar library

const { convert } = docxPdf;

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const inputDir = join(__dirname, '../combine_to_pdf/input');

const outputDir = join(__dirname, '../combine_to_pdf/output');
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
}

const combinedPdfPath = join(outputDir, 'combined.pdf');

async function convertDocToPdf(docPath, pdfPath) {
    console.log(`Converting DOC/DOCX to PDF: ${docPath} -> ${pdfPath}`);
    await convert(docPath, pdfPath);
    console.log(`Conversion complete: ${pdfPath}`);
}

async function combinePdfs(pdfPaths, outputPdfPath) {
    console.log(`Combining PDFs: ${pdfPaths.length} files`);
    const pdfDoc = await PDFDocument.create();
    for (const pdfPath of pdfPaths) {
        console.log(`Adding PDF to combined document: ${pdfPath}`);
        const pdfBytes = readFileSync(pdfPath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
            pdfDoc.addPage(page);
        });
    }
    const combinedPdfBytes = await pdfDoc.save();
    writeFileSync(outputPdfPath, combinedPdfBytes);
    console.log(`Combined PDF saved at: ${outputPdfPath}`);
}

async function main() {
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}`);
    }

    console.log(`Reading files from input directory: ${inputDir}`);
    const files = readdirSync(inputDir);
    const pdfPaths = [];

    // Initialize the progress bar
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(files.length, 0); // Start the progress bar

    for (const file of files) {
        const filePath = join(inputDir, file);
        const fileExt = extname(file).toLowerCase();
        console.log(`Processing file: ${filePath}`);
        if (fileExt === '.doc' || fileExt === '.docx') {
            const pdfPath = join(inputDir, `${basename(file, fileExt)}.pdf`);
            await convertDocToPdf(filePath, pdfPath);
            pdfPaths.push(pdfPath);
        } else if (fileExt === '.pdf') {
            console.log(`File is already a PDF: ${filePath}`);
            pdfPaths.push(filePath);
        } else {
            console.log(`Skipping unsupported file type: ${filePath}`);
        }

        // Update the progress bar
        progressBar.increment();
    }

    progressBar.stop(); // Stop the progress bar

    console.log(`Combining all PDFs into one file.`);
    await combinePdfs(pdfPaths, combinedPdfPath);
    console.log(`Process complete. Combined PDF created at: ${combinedPdfPath}`);
}

main().catch((err) => {
    console.error(`Error occurred: ${err.message}`);
    console.error(err);
});