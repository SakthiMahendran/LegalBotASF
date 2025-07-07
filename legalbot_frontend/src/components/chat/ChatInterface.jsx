import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSessionsStore, useMessagesStore, useAIStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import WelcomeScreen from '../WelcomeScreen';
import {
  Send,
  Bot,
  User,
  FileText,
  Download,
  Loader2
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
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { register, handleSubmit, reset, watch } = useForm();
  const messageText = watch('message', '');

  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
    } else {
      clearMessages();
    }
  }, [currentSession, fetchMessages, clearMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    if (!data.message.trim() || !currentSession) return;

    const userMessage = {
      id: Date.now().toString(),
      session: currentSession.id,
      role: 'user',
      content: data.message.trim(),
      metadata: {},
      created_at: new Date().toISOString(),
    };

    // Add user message locally first
    addLocalMessage(userMessage);
    reset();
    setIsTyping(true);

    try {
      // Save user message to backend
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
        id: (Date.now() + 1).toString(),
        session: currentSession.id,
        role: 'assistant',
        content: aiResponse.result,
        metadata: {
          isDocumentComplete: aiResponse.result.includes('DRAFT_COMPLETE:')
        },
        created_at: new Date().toISOString(),
      };

      // Add AI response locally and save to backend
      addLocalMessage(assistantMessage);
      await addMessage(assistantMessage);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        session: currentSession.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { isError: true },
        created_at: new Date().toISOString(),
      };
      addLocalMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessageContent = (content) => {
    if (content.includes('DRAFT_COMPLETE:')) {
      const documentContent = content.replace('DRAFT_COMPLETE:', '').trim();
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Document Generated Successfully!</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {documentContent}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap text-sm">
        {content}
      </div>
    );
  };

  if (!currentSession) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
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
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Start a conversation</p>
              <p className="text-sm text-gray-400">
                Ask me to help you create any legal document
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
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
      </ScrollArea>

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
  );
}
