import { useState } from 'react';
import { useSessionsStore, useAIStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Scale, 
  FileText, 
  MessageSquare, 
  Download,
  CheckCircle,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const documentTypes = [
  {
    title: 'Property Transfer Agreement',
    description: 'Transfer ownership of real estate property',
    icon: FileText,
    popular: true
  },
  {
    title: 'Employment Contract',
    description: 'Define terms of employment relationship',
    icon: FileText,
    popular: true
  },
  {
    title: 'Non-Disclosure Agreement',
    description: 'Protect confidential information',
    icon: Shield,
    popular: false
  },
  {
    title: 'Service Agreement',
    description: 'Contract for professional services',
    icon: FileText,
    popular: false
  },
  {
    title: 'Lease Agreement',
    description: 'Rental property lease contract',
    icon: FileText,
    popular: true
  },
  {
    title: 'Partnership Agreement',
    description: 'Business partnership terms',
    icon: FileText,
    popular: false
  }
];

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Generation',
    description: 'Generate legal documents instantly using advanced AI'
  },
  {
    icon: MessageSquare,
    title: 'Interactive Chat',
    description: 'Refine documents through natural conversation'
  },
  {
    icon: Download,
    title: 'Multiple Formats',
    description: 'Download as DOCX or PDF with professional formatting'
  },
  {
    icon: Shield,
    title: 'Legal Compliance',
    description: 'Documents follow standard legal practices and formats'
  }
];

export default function WelcomeScreen() {
  const { createSession } = useSessionsStore();
  const { healthStatus, checkHealth } = useAIStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDocument = async (documentType) => {
    setIsCreating(true);
    try {
      await createSession({
        title: `${documentType} - ${new Date().toLocaleDateString()}`,
        status: 'drafting'
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickStart = async () => {
    setIsCreating(true);
    try {
      await createSession({
        title: `New Legal Document - ${new Date().toLocaleDateString()}`,
        status: 'drafting'
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl">
              <Scale className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LegalBot
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your AI-powered legal document assistant
          </p>
          <Button 
            onClick={handleQuickStart}
            disabled={isCreating}
            size="lg"
            className="px-8 py-3"
          >
            {isCreating ? 'Creating...' : 'Start Creating Documents'}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popular Document Types
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((docType, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCreateDocument(docType.title)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <docType.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{docType.title}</CardTitle>
                      </div>
                    </div>
                    {docType.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {docType.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Describe Your Needs</h3>
                <p className="text-sm text-gray-600">
                  Tell our AI what type of legal document you need and provide the relevant details
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <h3 className="font-semibold mb-2">AI Generates Document</h3>
                <p className="text-sm text-gray-600">
                  Our AI creates a professional legal document based on your requirements
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Review & Download</h3>
                <p className="text-sm text-gray-600">
                  Review, refine, and download your document in DOCX or PDF format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Status */}
        {healthStatus && (
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-600">AI System Online</span>
              </div>
              <p className="text-sm text-gray-600">
                Ready to help you create legal documents
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
