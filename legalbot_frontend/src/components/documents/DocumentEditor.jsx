import { useState, useRef, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DocumentEditor.css';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  Save,
  Download,
  X,
  FileText,
  Type,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentEditor({
  document,
  onClose,
  onSave,
  onDownload
}) {
  const [content, setContent] = useState(document?.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    // Convert plain text to HTML for React Quill
    const documentContent = document?.content || '';
    const htmlContent = documentContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Check if it's a title (all caps)
        if (paragraph === paragraph.toUpperCase() && paragraph.length > 5) {
          return `<h1>${paragraph}</h1>`;
        }
        // Check if it's a section header (ends with colon)
        if (paragraph.endsWith(':') && paragraph.length < 50) {
          return `<h2>${paragraph}</h2>`;
        }
        // Check if it's a numbered item
        if (/^\d+\./.test(paragraph)) {
          return `<h3>${paragraph}</h3>`;
        }
        // Regular paragraph
        return `<p>${paragraph}</p>`;
      })
      .join('');

    setContent(htmlContent || '<p>Start editing your legal document...</p>');
    setHasChanges(false);
  }, [document]);

  // Custom Quill modules and formats for legal documents
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': ['serif', 'monospace'] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ],
      handlers: {
        // Custom handlers can be added here
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link'
  ];

  const handleContentChange = (value) => {
    setContent(value);
    setHasChanges(true);
  };

  const insertLegalTemplate = (templateName) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const templates = {
      whereas: '\n\nWHEREAS, [insert clause here];\n\n',
      nowTherefore: '\n\nNOW THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:\n\n',
      signature: '\n\n_________________________\nSignature\n\nDate: _______________\n\n',
      witnessWhereof: '\n\nIN WITNESS WHEREOF, the parties have executed this agreement as of the date first written above.\n\n',
      parties: '\n\nThis agreement is made between:\n\nParty A: [Name and Address]\n\nParty B: [Name and Address]\n\n',
      definitions: '\n\nDEFINITIONS\n\nFor the purposes of this agreement:\n\n1. [Term] means [definition]\n2. [Term] means [definition]\n\n'
    };

    const range = quill.getSelection();
    const index = range ? range.index : quill.getLength();
    quill.insertText(index, templates[templateName] || '');
    quill.setSelection(index + templates[templateName].length);
  };

  const handleSave = async () => {
    try {
      const quill = quillRef.current?.getEditor();
      const plainTextContent = quill?.getText() || '';

      await onSave({
        ...document,
        content: plainTextContent,
        formatted_content: content
      });
      setHasChanges(false);
      toast.success('Document saved successfully!');
    } catch (error) {
      toast.error('Failed to save document');
    }
  };

  const handleDownload = (format) => {
    const quill = quillRef.current?.getEditor();
    const plainTextContent = quill?.getText() || '';
    onDownload(plainTextContent, format);
  };

  const applyQuickFormat = (formatType) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection();
    if (!range) return;

    switch (formatType) {
      case 'title':
        quill.formatText(range.index, range.length, 'header', 1);
        quill.formatText(range.index, range.length, 'bold', true);
        quill.formatText(range.index, range.length, 'align', 'center');
        break;
      case 'section':
        quill.formatText(range.index, range.length, 'header', 2);
        quill.formatText(range.index, range.length, 'bold', true);
        break;
      case 'paragraph':
        quill.formatText(range.index, range.length, 'header', false);
        quill.formatText(range.index, range.length, 'bold', false);
        quill.formatText(range.index, range.length, 'align', 'left');
        break;
    }
  };

  return (
    <div className="w-1/2 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Document Editor</h3>
            <p className="text-sm text-gray-500">{document?.document_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Custom Toolbar */}
      <div className="p-3 border-b border-gray-200 space-y-3">
        {/* Quick Format Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyQuickFormat('title')}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Title Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyQuickFormat('section')}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Section Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyQuickFormat('paragraph')}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Paragraph Format
          </Button>
        </div>

        {/* Legal Template Insertions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('whereas')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Whereas Clause
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('nowTherefore')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Now Therefore
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('signature')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Signature Block
          </Button>
        </div>

        {/* Additional Legal Templates */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('parties')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Parties Section
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('definitions')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Definitions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertLegalTemplate('witnessWhereof')}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Witness Whereof
          </Button>
        </div>
      </div>

      {/* React Quill Editor */}
      <div className="flex-1 overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          style={{
            height: 'calc(100vh - 300px)',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="h-full"
        />
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('docx')}
          >
            <Download className="h-4 w-4 mr-2" />
            DOCX
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
