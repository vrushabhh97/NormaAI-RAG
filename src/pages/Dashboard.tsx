import { useState } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import ComparisonResults from '@/components/ComparisonResults';

const Dashboard = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    name: string;
    uploadDate: string;
    chunks: number;
  } | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  
  // Handle the completion of the file upload and comparison
  const handleComparisonComplete = (comparisonData: any, sessionId: string) => {
    console.log('Upload complete! Received data:', { 
      comparisonData, 
      sessionId,
      comparisonDataType: typeof comparisonData,
      sessionIdType: typeof sessionId
    });
    
    if (!sessionId) {
      console.warn('No session ID provided in response');
      return;
    }
    
    setSessionId(sessionId);
    setComparisonData(comparisonData);
    
    // Set document info
    setDocumentInfo({
      name: sessionId,
      uploadDate: new Date().toLocaleDateString(),
      chunks: comparisonData.chunks || 0
    });
    
    console.log('States updated:', {
      sessionId: sessionId,
      documentInfo: {
        name: sessionId,
        uploadDate: new Date().toLocaleDateString(),
        chunks: comparisonData.chunks || 0
      }
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="w-full py-2 px-4">
        <h1 className="text-3xl font-bold mb-3 px-2">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Left Column - Upload Section */}
          <div className="md:col-span-1">
            <FileUploader onComparisonComplete={handleComparisonComplete} />
            
            {/* Information Section */}
            {documentInfo && (
              <div className="mt-3 bg-card p-3 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Current Document</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{documentInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span>{documentInfo.uploadDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="text-xs text-muted-foreground">{sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analysis:</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - FDA Compliance Analysis */}
          <div className="md:col-span-2">
            <ComparisonResults comparisonData={comparisonData} sessionId={sessionId} />
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Dashboard;