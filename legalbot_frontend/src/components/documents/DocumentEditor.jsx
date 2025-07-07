import { useState, useRef, useEffect } from 'react';
import './DocumentEditor.css';
import { Button } from '../ui/button';
import { generatePDF, generateDOCX, generateFilename } from '../../utils/documentGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  Save,
  Download,
  X,
  FileText,
  Type,
  Plus,
  Minus,
  ArrowDown
} from 'lucide-react';

export default function DocumentEditor({
  document,
  onClose,
  onSave,
  onDownload
}) {
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const editorRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Convert plain text to HTML for the editor - only on document change
    const documentContent = document?.content || '';
    const htmlContent = documentContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Check if it's a title (all caps)
        if (paragraph === paragraph.toUpperCase() && paragraph.length > 5) {
          return `<h1 style="text-align: center; font-weight: bold; font-size: 20px; margin: 20px 0;">${paragraph}</h1>`;
        }
        // Check if it's a section header (ends with colon)
        if (paragraph.endsWith(':') && paragraph.length < 50) {
          return `<h2 style="font-weight: bold; font-size: 16px; margin: 16px 0 8px 0;">${paragraph}</h2>`;
        }
        // Check if it's a numbered item
        if (/^\d+\./.test(paragraph)) {
          return `<h3 style="font-weight: bold; font-size: 14px; margin: 12px 0 6px 0;">${paragraph}</h3>`;
        }
        // Regular paragraph
        return `<p style="margin: 8px 0; line-height: 1.6;">${paragraph}</p>`;
      })
      .join('');

    const finalContent = htmlContent || '<p>Start editing your legal document...</p>';
    setContent(finalContent);
    setHasChanges(false);
  }, [document]);

  // Separate useEffect to update editor content without affecting cursor
  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      // Only update if the editor is empty or this is the initial load
      if (editorRef.current.innerHTML === '' || editorRef.current.innerHTML === '<p>Start editing your legal document...</p>') {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Only update state, don't modify the DOM
      setContent(newContent);
      setHasChanges(true);
      // Update active formats and scroll after a small delay
      setTimeout(() => {
        updateActiveFormats();
        scrollToCursor();
      }, 10);
    }
  };

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline')
      });
    } catch (error) {
      // Ignore errors from queryCommandState
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  const scrollToCursor = () => {
    // Scroll to cursor position when editing
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const container = scrollContainerRef.current;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const isVisible = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;

        if (!isVisible) {
          // Scroll to make cursor visible
          const scrollTop = container.scrollTop + rect.top - containerRect.top - 100;
          container.scrollTop = Math.max(0, scrollTop);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          executeCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
      }
    }
  };

  const executeCommand = (command, value = null) => {
    // Store current selection
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Ensure the editor is focused
    if (editorRef.current) {
      editorRef.current.focus();

      // Restore selection if it was lost
      if (range && selection.rangeCount === 0) {
        selection.addRange(range);
      }
    }

    // Execute the command
    try {
      const success = document.execCommand(command, false, value);
      if (!success) {
        console.warn(`Command ${command} failed`);
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }

    // Update content and formats
    setTimeout(() => {
      handleContentChange();
      updateActiveFormats();
    }, 10);
  };

  const insertLegalTemplate = (templateName) => {
    const templates = {
      whereas: '<p><strong>WHEREAS</strong>, [insert clause here];</p><br>',
      nowTherefore: '<p><strong>NOW THEREFORE</strong>, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:</p><br>',
      signature: '<br><p>_________________________<br><strong>Signature</strong></p><p>Date: _______________</p><br>',
      witnessWhereof: '<p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this agreement as of the date first written above.</p><br>',
      parties: '<h2>PARTIES</h2><p>This agreement is made between:</p><p><strong>Party A:</strong> [Name and Address]</p><p><strong>Party B:</strong> [Name and Address]</p><br>',
      definitions: '<h2>DEFINITIONS</h2><p>For the purposes of this agreement:</p><ol><li>[Term] means [definition]</li><li>[Term] means [definition]</li></ol><br>'
    };

    executeCommand('insertHTML', templates[templateName] || '');
  };

  const handleFontSizeChange = (delta) => {
    const newSize = Math.max(8, Math.min(72, fontSize + delta));
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.style.fontSize = newSize + 'px';
    }
  };

  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    executeCommand('fontName', family);
  };

  const handleSave = async () => {
    try {
      const plainTextContent = editorRef.current?.innerText || '';

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

  const handleDownload = async (format) => {
    try {
      const htmlContent = editorRef.current?.innerHTML || content;
      const plainTextContent = editorRef.current?.innerText || '';

      // Generate filename based on document type
      const docType = document?.document_type || 'Legal Document';
      const baseName = docType.toLowerCase().replace(/\s+/g, '_');
      const filename = generateFilename(baseName, format);

      if (format === 'pdf') {
        await generatePDF(htmlContent, filename);
        toast.success('PDF downloaded successfully!');
      } else if (format === 'docx') {
        await generateDOCX(htmlContent, filename);
        toast.success('DOCX downloaded successfully!');
      } else {
        // Fallback to text download
        onDownload(plainTextContent, format);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${format.toUpperCase()} document`);
    }
  };

  const applyQuickFormat = (formatType) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    switch (formatType) {
      case 'title':
        executeCommand('fontSize', '20px');
        executeCommand('bold');
        executeCommand('justifyCenter');
        break;
      case 'section':
        executeCommand('fontSize', '16px');
        executeCommand('bold');
        executeCommand('justifyLeft');
        break;
      case 'paragraph':
        executeCommand('fontSize', fontSize + 'px');
        executeCommand('removeFormat');
        executeCommand('justifyLeft');
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
        {/* Font Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange(-1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">{fontSize}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange(1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <select
            value={fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        {/* Formatting Controls */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant={activeFormats.bold ? "default" : "outline"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('bold');
            }}
            className={`font-bold ${activeFormats.bold ? 'bg-blue-600 text-white' : ''}`}
          >
            B
          </Button>
          <Button
            variant={activeFormats.italic ? "default" : "outline"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('italic');
            }}
            className={`italic ${activeFormats.italic ? 'bg-blue-600 text-white' : ''}`}
          >
            I
          </Button>
          <Button
            variant={activeFormats.underline ? "default" : "outline"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('underline');
            }}
            className={`underline ${activeFormats.underline ? 'bg-blue-600 text-white' : ''}`}
          >
            U
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('justifyLeft');
            }}
          >
            ⬅
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('justifyCenter');
            }}
          >
            ↔
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('justifyRight');
            }}
          >
            ➡
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('undo');
            }}
          >
            ↶
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('redo');
            }}
          >
            ↷
          </Button>
        </div>

        {/* Quick Format Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              applyQuickFormat('title');
            }}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Title Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              applyQuickFormat('section');
            }}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Section Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              applyQuickFormat('paragraph');
            }}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Paragraph Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              editorRef.current?.focus();
              updateActiveFormats();
            }}
            className="text-xs bg-green-50"
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              scrollToBottom();
            }}
            className="text-xs bg-blue-50"
          >
            <ArrowDown className="h-3 w-3 mr-1" />
            Scroll Down
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editorRef.current) {
                editorRef.current.focus();
                // Insert test text to verify editor is working
                document.execCommand('insertHTML', false, '<strong>TEST BOLD</strong> ');
                handleContentChange();
              }
            }}
            className="text-xs bg-yellow-50"
          >
            🧪 Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editorRef.current) {
                editorRef.current.focus();
                // Insert lots of content to test scrolling
                const longContent = Array(20).fill(0).map((_, i) =>
                  `<p>This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>`
                ).join('');
                document.execCommand('insertHTML', false, longContent);
                handleContentChange();
              }
            }}
            className="text-xs bg-purple-50"
          >
            📄 Add Long Content
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

      {/* Custom Rich Text Editor */}
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4"
        style={{
          height: 'calc(100vh - 300px)',
          overflowY: 'scroll',
          scrollBehavior: 'smooth'
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          className="w-full p-6 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 legal-document-editor"
          style={{
            fontSize: fontSize + 'px',
            fontFamily: fontFamily,
            lineHeight: '1.6',
            minHeight: '600px',
            maxHeight: 'none',
            overflow: 'visible'
          }}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveFormats}
          onClick={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onPaste={(e) => {
            // Allow pasting but clean up the content
            setTimeout(() => {
              handleContentChange();
            }, 10);
          }}
          suppressContentEditableWarning={true}
          spellCheck={true}
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
