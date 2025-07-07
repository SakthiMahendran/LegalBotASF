import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSessionsStore, useMessagesStore, useAIStore, useDocumentsStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import WelcomeScreen from '../WelcomeScreen';
import DocumentEditor from '../documents/DocumentEditor';
import { toast } from 'sonner';
import { generatePDF, generateDOCX, generateFilename } from '../../utils/documentGenerator';
import {
  Send,
  Bot,
  User,
  FileText,
  Download,
  Loader2,
  ArrowDown,
  Edit3
} from 'lucide-react';

export default function ChatInterface() {
  const { currentSession } = useSessionsStore();
  const {
    messages,
    fetchMessages,
    addMessage,
    addLocalMessage,
    clearMessages
  } = useMessagesStore();
  const {
    generateDocument,
    isGenerating,
    error: aiError
  } = useAIStore();
  const { createDocument } = useDocumentsStore();
  
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const { register, handleSubmit, reset, watch } = useForm();
  const messageText = watch('message', '');

  useEffect(() => {
    if (currentSession) {
      // Clear messages first to prevent showing old messages
      clearMessages();
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        fetchMessages(currentSession.id);
      }, 50);
    } else {
      clearMessages();
    }
  }, [currentSession, fetchMessages, clearMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Also scroll when typing state changes
    if (!isTyping && !isGenerating) {
      scrollToBottom();
    }
  }, [isTyping, isGenerating]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      // Try both methods for better compatibility
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }

      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }, 100);
  };

  const onSubmit = async (data) => {
    if (!data.message.trim() || !currentSession) return;

    const userMessage = {
      session: currentSession.id,
      role: 'user',
      content: data.message.trim(),
      metadata: {},
    };

    reset();
    setIsTyping(true);

    try {
      // Save user message to backend (this will also add it to local state)
      await addMessage(userMessage);

      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      conversationHistory.push({
        role: 'user',
        content: data.message.trim()
      });

      // Generate AI response
      const aiResponse = await generateDocument({
        prompt: data.message.trim(),
        conversation_history: conversationHistory
      });

      const assistantMessage = {
        session: currentSession.id,
        role: 'assistant',
        content: aiResponse.result,
        metadata: {
          isDocumentComplete: aiResponse.result.includes('DRAFT_COMPLETE:')
        },
      };

      // Save AI response to backend (this will also add it to local state)
      await addMessage(assistantMessage);

      // If document is complete, automatically create a document record
      if (aiResponse.result.includes('DRAFT_COMPLETE:')) {
        try {
          const documentContent = aiResponse.result.replace('DRAFT_COMPLETE:', '').trim();

          // Determine document type from content or session title
          let documentType = 'Legal Document';
          if (currentSession.title.toLowerCase().includes('employment')) {
            documentType = 'Employment Contract';
          } else if (currentSession.title.toLowerCase().includes('property')) {
            documentType = 'Property Transfer Agreement';
          } else if (currentSession.title.toLowerCase().includes('nda') ||
                     currentSession.title.toLowerCase().includes('non-disclosure')) {
            documentType = 'Non-Disclosure Agreement';
          } else if (currentSession.title.toLowerCase().includes('lease')) {
            documentType = 'Lease Agreement';
          } else if (currentSession.title.toLowerCase().includes('service')) {
            documentType = 'Service Agreement';
          }

          const savedDocument = await createDocument({
            session: currentSession.id,
            document_type: documentType,
            content: documentContent,
            formatted_content: documentContent
          });

          console.log('Document automatically saved to documents library');
          toast.success('Document saved to library!', {
            description: `${documentType} has been saved and is available in the Documents section.`
          });

          // Set the current document for editing
          setCurrentDocument({
            ...savedDocument,
            content: documentContent,
            document_type: documentType
          });
        } catch (error) {
          console.error('Failed to save document:', error);
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);

      // Get more specific error message
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.status === 400) {
        errorText = 'Bad request. Please check your input and try again.';
      } else if (error.response?.status === 401) {
        errorText = 'Authentication required. Please refresh the page.';
      } else if (error.response?.status === 500) {
        errorText = 'Server error. Please try again later.';
      } else if (error.message) {
        errorText = `Error: ${error.message}`;
      }

      const errorMessage = {
        session: currentSession.id,
        role: 'assistant',
        content: errorText,
        metadata: { isError: true },
      };
      // For error messages, just add locally (don't save to backend)
      addLocalMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadDocument = async (content, format) => {
    try {
      // Generate filename
      const filename = generateFilename('legal_document', format);

      if (format === 'pdf') {
        await generatePDF(content, filename);
        toast.success('PDF downloaded successfully!');
      } else if (format === 'docx') {
        await generateDOCX(content, filename);
        toast.success('DOCX downloaded successfully!');
      } else {
        // Fallback to text download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Document downloaded as ${format.toUpperCase()}!`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${format.toUpperCase()} document`);
    }
  };

  const handleEditorSave = async (updatedDocument) => {
    try {
      // Update the document in the store
      await createDocument(updatedDocument);
      setCurrentDocument(updatedDocument);
      toast.success('Document updated successfully!');
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document changes');
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setCurrentDocument(null);
  };

  const formatMessageContent = (content) => {
    if (content.includes('DRAFT_COMPLETE:')) {
      const documentContent = content.replace('DRAFT_COMPLETE:', '').trim();

      // Format the document content for better display
      const formatDocumentText = (text) => {
        // Split into lines and format
        const lines = text.split('\n');
        const formattedLines = lines.map((line, index) => {
          const trimmedLine = line.trim();

          // Skip empty lines
          if (!trimmedLine) return null;

          // Format document title (all caps)
          if (trimmedLine.match(/^[A-Z\s]+$/) && trimmedLine.length > 5) {
            return (
              <h1 key={index} className="text-xl font-bold text-center mb-6 text-gray-900">
                {trimmedLine}
              </h1>
            );
          }

          // Format section headers (ending with colon)
          if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
            return (
              <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                {trimmedLine}
              </h3>
            );
          }

          // Format numbered sections
          if (trimmedLine.match(/^\d+\./)) {
            return (
              <p key={index} className="mb-3 text-gray-700 font-medium">
                {trimmedLine}
              </p>
            );
          }

          // Regular paragraphs
          return (
            <p key={index} className="mb-3 text-gray-700 leading-relaxed">
              {trimmedLine}
            </p>
          );
        }).filter(Boolean);

        return formattedLines;
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Legal Document Generated Successfully!</span>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
            <div className="prose prose-sm max-w-none">
              {formatDocumentText(documentContent)}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setCurrentDocument({
                  content: documentContent,
                  document_type: 'Legal Document',
                  formatted_content: documentContent
                });
                setShowEditor(true);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Document
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => handleDownloadDocument(documentContent, 'docx')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleDownloadDocument(documentContent, 'pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    );
  };

  if (!currentSession) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex-1 flex bg-white h-screen overflow-hidden">
      {/* Chat Interface */}
      <div className={`flex flex-col ${showEditor ? 'w-1/2' : 'w-full'} transition-all duration-300 h-full`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentSession.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {currentSession.status}
              </Badge>
              <span className="text-xs text-gray-500">
                Created {new Date(currentSession.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-400">
                ID: {currentSession.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 scroll-smooth"
        >
          <div className="space-y-4 max-w-4xl mx-auto pb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Start a conversation</p>
              <p className="text-sm text-gray-400">
                Ask me to help you create any legal document
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id || `message-${index}-${message.created_at}`}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              )}
              
              <Card className={`max-w-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardContent className="p-4">
                  {formatMessageContent(message.content)}
                </CardContent>
              </Card>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {(isTyping || isGenerating) && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me to create a legal document..."
              className="flex-1"
              disabled={isGenerating}
              {...register('message', { required: true })}
            />
            <Button 
              type="submit" 
              disabled={!messageText.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
      </div>

      {/* Document Editor */}
      {showEditor && currentDocument && (
        <DocumentEditor
          document={currentDocument}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          onDownload={handleDownloadDocument}
        />
      )}
    </div>
  );
}
