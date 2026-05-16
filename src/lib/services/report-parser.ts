import * as XLSX from "xlsx";
import Papa from "papaparse";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

export interface ParsedFile {
  name: string;
  type: string;
  content: string;
  preview: string;
  wordCount: number;
}

export type FileType = "excel" | "csv" | "pdf" | "docx" | "md" | "txt" | "json";

export function detectFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  const typeMap: Record<string, FileType> = {
    xlsx: "excel",
    xls: "excel",
    csv: "csv",
    pdf: "pdf",
    docx: "docx",
    md: "md",
    markdown: "md",
    txt: "txt",
    json: "json",
  };
  return ext ? typeMap[ext] || null : null;
}

export async function parseFile(
  file: { name: string; content: ArrayBuffer | Buffer | string }
): Promise<ParsedFile> {
  const filename = file.name;
  const type = detectFileType(filename);

  if (!type) {
    throw new Error(`Unsupported file type: ${filename}`);
  }

  let content = "";
  let preview = "";

  switch (type) {
    case "excel": {
      let buffer: Uint8Array;
      if (file.content instanceof ArrayBuffer) {
        buffer = new Uint8Array(file.content);
      } else if (Buffer.isBuffer(file.content)) {
        buffer = new Uint8Array(file.content);
      } else if (typeof file.content === "string") {
        // It's a base64 string - decode it
        const decoded = Buffer.from(file.content, "base64");
        buffer = new Uint8Array(decoded);
      } else {
        throw new Error("Invalid content type for Excel file");
      }
      console.log(`[parseFile] Excel buffer length: ${buffer.length}, first bytes: ${Array.from(buffer.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      try {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheets: string[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          sheets.push(`=== Sheet: ${sheetName} ===\n${csv}`);
        }
        content = sheets.join("\n\n");
        preview = content.substring(0, 500);
      } catch (workbookError) {
        throw new Error(`Failed to parse Excel workbook: ${workbookError instanceof Error ? workbookError.message : String(workbookError)}`);
      }
      break;
    }

    case "csv": {
      const text = file.content instanceof ArrayBuffer
        ? new TextDecoder().decode(file.content)
        : file.content as string;
      const result = Papa.parse(text, { header: true });
      content = JSON.stringify(result.data, null, 2);
      preview = content.substring(0, 500);
      break;
    }

    case "pdf": {
      const buffer = file.content instanceof ArrayBuffer
        ? new Uint8Array(file.content)
        : new TextEncoder().encode(file.content as string);
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      content = textResult.text || "";
      preview = content.substring(0, 500);
      break;
    }

    case "docx": {
      const buffer = file.content instanceof ArrayBuffer
        ? Buffer.from(file.content)
        : Buffer.from(file.content as string);
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
      preview = content.substring(0, 500);
      break;
    }

    case "md":
    case "txt": {
      content = file.content instanceof ArrayBuffer
        ? new TextDecoder().decode(file.content)
        : file.content as string;
      preview = content.substring(0, 500);
      break;
    }

    case "json": {
      const text = file.content instanceof ArrayBuffer
        ? new TextDecoder().decode(file.content)
        : file.content as string;
      const obj = JSON.parse(text);
      content = JSON.stringify(obj, null, 2);
      preview = content.substring(0, 500);
      break;
    }
  }

  return {
    name: filename,
    type,
    content: content.substring(0, 50000),  // Limit content to 50k chars
    preview,
    wordCount: content.length,
  };
}
