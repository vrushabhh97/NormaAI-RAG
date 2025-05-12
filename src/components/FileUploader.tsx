import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { API_ENDPOINTS } from '@/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadResponse {
  upload_status: string;
  session_id: string;
  chunks: number;
  comparison: any;
}

interface FileUploaderProps {
  onComparisonComplete: (comparisonData: any, sessionId: string) => void;
}

export function FileUploader({ onComparisonComplete }: FileUploaderProps) {
  // SOP upload state
  const [sopFile, setSopFile] = useState<File | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [isUploadingSop, setIsUploadingSop] = useState(false);
  const [sopProgress, setSopProgress] = useState(0);
  const [sopStage, setSopStage] = useState('upload');
  
  // FDA upload state
  const [fdaFile, setFdaFile] = useState<File | null>(null);
  const [fdaLabel, setFdaLabel] = useState('');
  const [isUploadingFda, setIsUploadingFda] = useState(false);
  const [fdaProgress, setFdaProgress] = useState(0);
  
  const handleSopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setSopFile(selectedFile);
      if (!sessionName) {
        setSessionName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };
  
  const handleFdaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFdaFile(selectedFile);
      if (!fdaLabel) {
        setFdaLabel(selectedFile.name.replace('.pdf', ''));
      }
    }
  };
  
  const handleSopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopFile) {
      toast.error('Please select a file');
      return;
    }
    
    if (!sessionName) {
      toast.error('Please provide a session name');
      return;
    }
    
    setIsUploadingSop(true);
    setSopStage('upload');
    setSopProgress(10);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', sopFile);
      formData.append('session_id', sessionName);
      
      // Start the upload
      setSopProgress(30);
      
      // Call the API
      const response = await fetch(API_ENDPOINTS.UPLOAD_TO_FAISS, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      setSopProgress(70);
      setSopStage('processing');
      
      // Parse the response
      const data: UploadResponse = await response.json();
      
      setSopProgress(100);
      console.log('Upload response data:', data);
      
      // Call the callback with the comparison data
      if (data.comparison) {
        // Parsing JSON if it's a string
        let comparisonData = data.comparison;
        console.log('Raw comparison data:', comparisonData);
        
        if (typeof comparisonData === 'string') {
          try {
            // Try to parse as JSON
            comparisonData = JSON.parse(comparisonData);
            console.log('Parsed comparison data as JSON:', comparisonData);
          } catch (e) {
            console.warn('Could not parse comparison data as JSON, checking for embedded JSON:', e);
            
            // Try to extract JSON from the string using regex
            try {
              const potentialJsonMatch = comparisonData.match(/\{[\s\S]*\}/);
              if (potentialJsonMatch) {
                const jsonStr = potentialJsonMatch[0];
                comparisonData = JSON.parse(jsonStr);
                console.log('Extracted JSON from text:', comparisonData);
              }
            } catch (extractError) {
              console.error('Could not extract JSON from text:', extractError);
            }
          }
        }
        
        onComparisonComplete(comparisonData, data.session_id);
        toast.success(`Document processed with ${data.chunks} chunks!`);
      } else {
        console.error('No comparison data in response:', data);
        toast.error('No comparison data returned from server');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingSop(false);
      setSopProgress(0);
      setSopStage('upload');
    }
  };
  
  const handleFdaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fdaFile) {
      toast.error('Please select a file');
      return;
    }
    
    if (!fdaLabel) {
      toast.error('Please provide a label for the FDA document');
      return;
    }
    
    setIsUploadingFda(true);
    setFdaProgress(10);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', fdaFile);
      formData.append('label', fdaLabel);
      
      // Start the upload
      setFdaProgress(30);
      
      // Call the API for FDA upload
      const response = await fetch(API_ENDPOINTS.UPLOAD_PDF, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      setFdaProgress(70);
      
      // Parse the response
      const data = await response.json();
      
      setFdaProgress(100);
      
      // Show success message
      toast.success(`FDA document "${fdaLabel}" uploaded successfully with ${data.message}`);
      
      // Reset form
      setFdaFile(null);
      setFdaLabel('');
      
    } catch (error) {
      console.error('FDA upload error:', error);
      toast.error(`FDA upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingFda(false);
      setFdaProgress(0);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload SOP or FDA documents for analysis and comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sop">Upload SOP Document</TabsTrigger>
            <TabsTrigger value="fda">Upload FDA Document</TabsTrigger>
          </TabsList>
          
          {/* SOP Document Tab */}
          <TabsContent value="sop">
            <form onSubmit={handleSopSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  placeholder="Enter a descriptive name for this session"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  disabled={isUploadingSop}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sop-file-upload">Upload SOP PDF Document</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  {sopFile ? (
                    <div className="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="currentColor"/>
                      </svg>
                      <span>{sopFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Drag & drop your SOP PDF here or click to browse
                      </p>
                    </>
                  )}
                  <Input
                    id="sop-file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleSopFileChange}
                    disabled={isUploadingSop}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('sop-file-upload')?.click()} disabled={isUploadingSop}>
                    Select File
                  </Button>
                </div>
              </div>
              
              {isUploadingSop && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{sopStage === 'upload' ? 'Uploading...' : 'Processing document...'}</span>
                    <span>{sopProgress}%</span>
                  </div>
                  <Progress value={sopProgress} />
                </div>
              )}
              
              <Button type="submit" onClick={handleSopSubmit} disabled={!sopFile || isUploadingSop || !sessionName} className="w-full">
                {isUploadingSop ? (sopStage === 'upload' ? 'Uploading...' : 'Processing...') : 'Upload & Process SOP'}
              </Button>
            </form>
          </TabsContent>
          
          {/* FDA Document Tab */}
          <TabsContent value="fda">
            <form onSubmit={handleFdaSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fda-label">FDA Document Label</Label>
                <Input
                  id="fda-label"
                  placeholder="Enter a descriptive label for this FDA document"
                  value={fdaLabel}
                  onChange={(e) => setFdaLabel(e.target.value)}
                  disabled={isUploadingFda}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fda-file-upload">Upload FDA PDF Document</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  {fdaFile ? (
                    <div className="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="currentColor"/>
                      </svg>
                      <span>{fdaFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Drag & drop your FDA PDF here or click to browse
                      </p>
                    </>
                  )}
                  <Input
                    id="fda-file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFdaFileChange}
                    disabled={isUploadingFda}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('fda-file-upload')?.click()} disabled={isUploadingFda}>
                    Select File
                  </Button>
                </div>
              </div>
              
              {isUploadingFda && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading FDA document...</span>
                    <span>{fdaProgress}%</span>
                  </div>
                  <Progress value={fdaProgress} />
                </div>
              )}
              
              <Button type="submit" onClick={handleFdaSubmit} disabled={!fdaFile || isUploadingFda || !fdaLabel} className="w-full">
                {isUploadingFda ? 'Uploading...' : 'Upload FDA Document'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Upload SOP documents for analysis and FDA documents for reference.</p>
      </CardFooter>
    </Card>
  );
}

export default FileUploader;
