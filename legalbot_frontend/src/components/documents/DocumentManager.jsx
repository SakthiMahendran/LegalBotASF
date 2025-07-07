import { useState, useEffect } from 'react';
import { useDocumentsStore, useSessionsStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Download, 
  FileText, 
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function DocumentManager() {
  const { 
    documents, 
    fetchDocuments, 
    downloadDocument, 
    isLoading 
  } = useDocumentsStore();
  const { sessions } = useSessionsStore();
  
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (documentId, format) => {
    try {
      await downloadDocument(documentId, format);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getSessionTitle = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.title || 'Unknown Session';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'drafting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-white">
      {/* Documents List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No documents yet</p>
              </div>
            ) : (
              documents.map((document) => (
                <Card 
                  key={document.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedDocument?.id === document.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDocument(document)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {document.document_type}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {document.session ? getSessionTitle(document.session) : 'No Session'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Created {new Date(document.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {document.content.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Document Preview */}
      <div className="flex-1 flex flex-col">
        {selectedDocument ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedDocument.document_type}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(selectedDocument.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Updated {new Date(selectedDocument.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedDocument.id, 'docx')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    DOCX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedDocument.id, 'pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                        {selectedDocument.formatted_content || selectedDocument.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Actions */}
                <div className="mt-6 flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Document
              </h3>
              <p className="text-gray-500">
                Choose a document from the list to view its content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
