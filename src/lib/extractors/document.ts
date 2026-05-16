import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export interface DocumentExtractResult {
  title: string;
  content: string;
}

export async function extractFromPdf(buffer: Buffer): Promise<DocumentExtractResult> {
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  const infoResult = await parser.getInfo();
  return {
    title: infoResult.info?.Title || 'PDF Document',
    content: textResult.text.replace(/\s+/g, ' ').substring(0, 8000),
  };
}

export async function extractFromDocx(buffer: Buffer): Promise<DocumentExtractResult> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    title: 'Word Document',
    content: result.value.replace(/\s+/g, ' ').substring(0, 8000),
  };
}