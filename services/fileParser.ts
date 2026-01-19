
// @ts-nocheck - To allow using global libraries from CDN like pdfjsLib and ePub

const PDF_JS_VERSION = '4.3.136';
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.mjs`;
}

async function parsePdf(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const paragraphs: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // A simple heuristic to group text items into paragraphs
        let currentParagraph = '';
        let lastY = -1;

        textContent.items.sort((a, b) => {
            if (a.transform[5] > b.transform[5]) return -1;
            if (a.transform[5] < b.transform[5]) return 1;
            if (a.transform[4] < b.transform[4]) return -1;
            if (a.transform[4] > b.transform[4]) return 1;
            return 0;
        });

        for (const item of textContent.items) {
            const currentY = item.transform[5];
            if (lastY !== -1 && Math.abs(currentY - lastY) > (item.height * 1.5)) {
                if (currentParagraph.trim()) paragraphs.push(currentParagraph.trim());
                currentParagraph = '';
            }
            currentParagraph += item.str + (item.str.endsWith(' ') ? '' : ' ');
            lastY = currentY;
        }
        if (currentParagraph.trim()) paragraphs.push(currentParagraph.trim());
    }

    return paragraphs.filter(p => p.length > 2); // Filter out very short lines
}


async function parseEpub(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    await book.ready;
    
    const allParagraphs: string[] = [];
    
    const sections = book.spine.spineItems.map(item => item.load(book.load.bind(book)));
    const loadedSections = await Promise.all(sections);
    
    for (const section of loadedSections) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = section.innerHTML;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const paragraphs = text.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(p => p.length > 0);
        allParagraphs.push(...paragraphs);
    }

    return allParagraphs;
}

export async function parseFile(file: File): Promise<string[]> {
    if (!file) throw new Error("No file provided.");

    const fileName = file.name.toLowerCase();
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        return parsePdf(file);
    }
    if (file.type === 'application/epub+zip' || fileName.endsWith('.epub')) {
        return parseEpub(file);
    }
    throw new Error('Unsupported file type. Please upload a PDF or ePub file.');
}
