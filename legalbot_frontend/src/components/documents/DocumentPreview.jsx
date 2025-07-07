import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Eye, 
  Code, 
  Edit, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Home,
  Scale,
  FileEdit
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

const DocumentPreview = ({ 
  document, 
  onUpdate, 
  onDownload, 
  onRefine 
}) => {
  const [previewTab, setPreviewTab] = useState('rendered');
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(document?.content || '');
  const [verified, setVerified] = useState(false);
  const [fileFormat, setFileFormat] = useState('docx');
  const [fileName, setFileName] = useState('legal_document');
  const [refinementRequest, setRefinementRequest] = useState('');
  const [editableDetails, setEditableDetails] = useState({
    'Document Type': document?.document_type || 'Legal Document',
    'Party 1 Name': 'John Smith',
    'Party 2 Name': 'Jane Doe',
    'Effective Date': '2024-01-01',
    'Property Address': '123 Main Street',
    'Consideration': '$100,000',
    'Governing Law': 'State of California',
    ...document?.details
  });

  const handleDetailChange = (key, value) => {
    setEditableDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleVerificationChange = (checked) => {
    setVerified(checked);
    if (checked) {
      toast.success('Document details verified!');
    }
  };

  const handleUpdateDocument = () => {
    onUpdate?.(editedContent);
    setEditMode(false);
    toast.success('Document updated successfully!');
  };

  const handleDownload = () => {
    const filename = `${fileName}.${fileFormat}`;
    onDownload?.(document?.content || editedContent, fileFormat, filename);
  };

  const handleRefinement = () => {
    onRefine?.(refinementRequest);
    setRefinementRequest('');
    toast.success('Refinement request sent!');
  };

  const categorizeDetails = useCallback(() => {
    const categories = {
      parties: {},
      dates: {},
      property: {},
      legal: {},
      other: {},
    };

    Object.entries(editableDetails).forEach(([key, value]) => {
      if (key === 'Document Type') {
        return;
      } else if (
        key.toLowerCase().includes('party') ||
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('relationship') ||
        key.toLowerCase().includes('address')
      ) {
        categories.parties[key] = value;
      } else if (
        key.toLowerCase().includes('date') ||
        key.toLowerCase().includes('period') ||
        key.toLowerCase().includes('duration')
      ) {
        categories.dates[key] = value;
      } else if (
        key.toLowerCase().includes('property') ||
        key.toLowerCase().includes('legal description') ||
        key.toLowerCase().includes('subject')
      ) {
        categories.property[key] = value;
      } else if (
        key.toLowerCase().includes('governing') ||
        key.toLowerCase().includes('law') ||
        key.toLowerCase().includes('consideration') ||
        key.toLowerCase().includes('transfer type')
      ) {
        categories.legal[key] = value;
      } else {
        categories.other[key] = value;
      }
    });

    return categories;
  }, [editableDetails]);

  const categories = categorizeDetails();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Document Preview Header */}
      <Card className="rounded-none border-b flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              📄 Document Preview
            </CardTitle>
            <Badge variant={verified ? "default" : "secondary"} className="flex items-center gap-1">
              {verified ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {verified ? 'Verified' : 'Needs Verification'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Document Preview Content */}
      <div className="border-b flex-1 flex flex-col min-h-0">
        {/* Preview Tabs */}
        <Tabs value={previewTab} onValueChange={setPreviewTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 rounded-none flex-shrink-0">
            <TabsTrigger value="rendered" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Rendered
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Raw/Edit
            </TabsTrigger>
          </TabsList>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <TabsContent value="rendered" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                    <Card className="p-6">
                      <div className="prose prose-lg max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold text-center mb-6 font-serif">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold mt-6 mb-4 font-serif">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-bold mt-4 mb-2 font-serif">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 leading-relaxed text-justify font-serif">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold font-serif">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic font-serif">
                                {children}
                              </em>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-6 mb-4 font-serif">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-6 mb-4 font-serif">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="mb-1 font-serif">
                                {children}
                              </li>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 ml-4 italic bg-gray-50 p-4 rounded">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {document?.formatted_content || document?.content || 'No content available'}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

            <TabsContent value="raw" className="h-full m-0">
              <div className="h-full p-4">
                <Textarea
                  value={editMode ? editedContent : (document?.formatted_content || document?.content || '')}
                  onChange={(e) => setEditedContent(e.target.value)}
                  readOnly={!editMode}
                  className="h-full font-mono text-sm resize-none overflow-y-auto"
                  style={{ minHeight: '100%' }}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Preview Controls */}
        <div className="p-4 border-t flex-shrink-0">
          <p className="text-sm text-muted-foreground mb-3">
            📄 {editMode ? 'Editing mode - Click Update to save' : 'Live preview • Updates automatically'}
          </p>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {editMode ? 'View' : 'Edit'}
            </Button>

            {editMode && (
              <Button
                size="sm"
                onClick={handleUpdateDocument}
              >
                Update
              </Button>
            )}

            {verified && (
              <>
                <Select value={fileFormat} onValueChange={setFileFormat}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Controls - ALL FEATURES RESTORED */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">🔧 Document Controls</h3>

          {/* Document Refinement */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="refinement">
              <AccordionTrigger className="text-sm font-medium">
                ✏️ Refine Document
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ask the AI to make specific changes to your document.
                  </p>
                  <Textarea
                    placeholder="e.g., Change the date to December 1, 2024, or add a clause about..."
                    value={refinementRequest}
                    onChange={(e) => setRefinementRequest(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleRefinement}
                    disabled={!refinementRequest.trim()}
                    className="w-full"
                    size="sm"
                  >
                    Refine Document
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Document Details Verification */}
            <AccordionItem value="verification" defaultValue="verification">
              <AccordionTrigger className="text-sm font-medium">
                🔍 Verify Document Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Document Type - Non-editable */}
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">📋 Document Type</Label>
                    <Input
                      id="doc-type"
                      value={editableDetails['Document Type'] || 'Legal Document'}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Document type is automatically detected and cannot be changed
                    </p>
                  </div>

                  {/* Categorized Details */}
                  {Object.keys(categories.parties).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        👥 Parties Information:
                      </h4>
                      {Object.entries(categories.parties).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs">{key}</Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(categories.dates).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        📅 Dates & Duration:
                      </h4>
                      {Object.entries(categories.dates).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs">{key}</Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(categories.property).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        🏠 Property Details:
                      </h4>
                      {Object.entries(categories.property).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs">{key}</Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(categories.legal).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        ⚖️ Legal Terms:
                      </h4>
                      {Object.entries(categories.legal).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs">{key}</Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(categories.other).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <FileEdit className="h-4 w-4" />
                        📝 Other Details:
                      </h4>
                      {Object.entries(categories.other).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs">{key}</Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Verification Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verification"
              checked={verified}
              onCheckedChange={handleVerificationChange}
            />
            <Label htmlFor="verification" className="text-sm">
              I have verified all the details above are correct
            </Label>
          </div>

          <Separator />

          {/* Download Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📥 Download Options</h3>

            {verified ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="filename">Document File Name</Label>
                  <Input
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Choose file format</Label>
                  <Select value={fileFormat} onValueChange={setFileFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  🔽 Download Document
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please verify the details above to enable document download.
                </AlertDescription>
              </Alert>
            )}
          </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DocumentPreview;
