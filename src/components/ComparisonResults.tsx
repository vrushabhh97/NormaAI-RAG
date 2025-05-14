import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileText, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config';

interface ComparisonItem {
  id: number;
  title: string;
  fdaSummary: string;
  sopSummary: string;
  issues: string[];
  isCompliant: boolean;
}

// Updated interface to match the new API response format
interface PotentialIssue {
  issue: string;
  category: string;
  fda_requirement: string;
  sop_detail: string;
}

interface ApiResponseData {
  title: string;
  fda_requirement_summary: string;
  user_summary: string;
  potential_issues: PotentialIssue[] | string[];
}

interface ComparisonResultsProps {
  comparisonData: any;
  sessionId: string | null;
}

// Helper function to generate a descriptive title from an issue text
const generateTitleFromIssue = (issue: string, baseTitle: string): string => {
  // Extract first few meaningful words from the issue
  const words = issue.split(' ').filter(word => word.length > 3);
  const key = words.slice(0, 3).join(' ');
  
  // Generate a descriptive title based on the issue content
  if (issue.toLowerCase().includes('validation')) {
    return 'Validation Process';
  } else if (issue.toLowerCase().includes('calibration') || issue.toLowerCase().includes('equipment')) {
    return 'Equipment Calibration Requirements';
  } else if (issue.toLowerCase().includes('training') || issue.toLowerCase().includes('personnel')) {
    return 'Personnel Training Documentation';
  } else if (issue.toLowerCase().includes('document') || issue.toLowerCase().includes('documentation')) {
    return 'Documentation Requirements';
  } else if (issue.toLowerCase().includes('process') || issue.toLowerCase().includes('procedure')) {
    return 'Process Requirements';
  } else if (issue.toLowerCase().includes('quality')) {
    return 'Quality Control Requirements';
  } else if (issue.toLowerCase().includes('record')) {
    return 'Record Keeping Requirements';
  } else {
    // If no specific keywords found, use the base title
    return baseTitle;
  }
};

// Helper function to extract specific FDA requirements based on the issue
const extractFDARequirement = (issue: string, fullRequirement: string): string => {
  // Default to the full requirement
  if (!fullRequirement) return "FDA requirement not available";
  
  // Create specific requirements based on issue keywords
  const keywords = [
    'validation', 'calibration', 'equipment', 'training', 'personnel', 
    'document', 'process', 'quality', 'record', 'procedure'
  ];
  
  // Try to extract relevant sentences from the full requirement
  const sentences = fullRequirement.split(/(?<=[.!?])\s+/);
  
  // Find sentences that contain keywords present in the issue
  const matchingSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => 
      issue.toLowerCase().includes(keyword) && lowerSentence.includes(keyword)
    );
  });
  
  // If we found matching sentences, use them; otherwise, use the full requirement
  return matchingSentences.length > 0 
    ? matchingSentences.join(' ') 
    : fullRequirement;
};

// Helper function to extract specific SOP details based on the issue
const extractSOPDetail = (issue: string, fullSOP: string): string => {
  // Default to the full SOP
  if (!fullSOP) return "SOP detail not available";
  
  // Create specific SOP details based on issue keywords
  const keywords = [
    'validation', 'calibration', 'equipment', 'training', 'personnel', 
    'document', 'process', 'quality', 'record', 'procedure'
  ];
  
  // Try to extract relevant sentences from the full SOP
  const sentences = fullSOP.split(/(?<=[.!?])\s+/);
  
  // Find sentences that contain keywords present in the issue
  const matchingSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => 
      issue.toLowerCase().includes(keyword) && lowerSentence.includes(keyword)
    );
  });
  
  // If we found matching sentences, use them; otherwise, use the full SOP
  return matchingSentences.length > 0 
    ? matchingSentences.join(' ') 
    : fullSOP;
};

// Add a theme detection hook
function useThemeDetector() {
  const [isDarkTheme, setIsDarkTheme] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          setIsDarkTheme(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return isDarkTheme;
}

// Add a helper function to format the answer text with proper styling
const formatChatAnswer = (text: string, isDarkTheme: boolean) => {
  if (!text) return '';
  
  // Replace section headers (text with double asterisks)
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format numbered lists (lines starting with a number followed by a period)
  formattedText = formattedText.replace(/(\d+\.\s)(.*?)(?=\n|$)/g, 
    `<div class="flex gap-2 mb-2"><span class="font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span><span>$2</span></div>`);
  
  // Remove bullet style dashes for points (lines starting with "- ")
  formattedText = formattedText.replace(/^\s*-\s+/gm, '');
  
  // Add spacing between sections based on empty lines
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="mt-3">');
  
  // Format SOP Document and FDA Guidelines labels to appear on new lines
  formattedText = formattedText.replace(/(SOP Document:)/g, 
    `</p><p class="mt-3"><span class="font-semibold block mb-1 ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span>`);
  
  formattedText = formattedText.replace(/(FDA Guidelines:)/g, 
    `</p><p class="mt-3"><span class="font-semibold block mb-1 ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span>`);
  
  // Handle section titles with "Information from..." and similar patterns
  formattedText = formattedText.replace(/(Information from .*?:)/g, 
    `<span class="font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span>`);
  formattedText = formattedText.replace(/(Discrepancies:)/g, 
    `<span class="font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span>`);
  formattedText = formattedText.replace(/(Unanswered Aspects:)/g, 
    `<span class="font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}">$1</span>`);
  
  // Format source references
  formattedText = formattedText.replace(/\(Source:.*?\)/g, 
    `<span class="text-xs ${isDarkTheme ? 'text-slate-400' : 'text-muted-foreground'} block mt-1">$&</span>`);
  
  return `<p>${formattedText}</p>`;
};

export function ComparisonResults({ comparisonData, sessionId }: ComparisonResultsProps) {
  const [comparisonResults, setComparisonResults] = useState<ComparisonItem[]>([]);
  const [actionItems, setActionItems] = useState<{id: number; text: string; completed: boolean}[]>([]);
  const [rawOutput, setRawOutput] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{question: string; answer: string}[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isDarkTheme = useThemeDetector();
  // Add a ref for the chat container to enable scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Add state to track the active tab
  const [activeTab, setActiveTab] = useState<string>("comparison");
  
  // Don't show raw output anymore - we'll focus on displaying the formatted data
  useEffect(() => {
    setRawOutput(null);
  }, [comparisonData]);
  
  // Add a function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Scroll to bottom whenever chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Process the comparison data from the API
  useEffect(() => {
    if (!comparisonData) return;
    
    try {
      console.log('Received comparison data:', comparisonData);
      
      // Transform API data to the format required by the component
      let transformedData: ComparisonItem[] = [];
      
      // If comparisonData is a string (JSON string), try to parse it
      let data = comparisonData;
      if (typeof comparisonData === 'string') {
        try {
          data = JSON.parse(comparisonData);
          console.log('Parsed JSON data:', data);
        } catch (e) {
          console.error('Failed to parse comparison data as JSON:', e);
        }
      }
      
      // Handle when data is in the comparison property
      if (comparisonData.comparison) {
        console.log('Found comparison property:', comparisonData.comparison);
        if (typeof comparisonData.comparison === 'string') {
          try {
            data = JSON.parse(comparisonData.comparison);
            console.log('Parsed comparison JSON data:', data);
          } catch (e) {
            console.warn('Could not parse comparison as JSON, trying to extract data:', e);
            try {
              // Try to extract data from the string using regex
              const text = comparisonData.comparison;
              const potentialJsonMatch = text.match(/\{[\s\S]*\}/);
              if (potentialJsonMatch) {
                const jsonStr = potentialJsonMatch[0];
                data = JSON.parse(jsonStr);
                console.log('Extracted JSON from text:', data);
              } else {
                data = comparisonData.comparison;
              }
            } catch (innerError) {
              console.error('Could not extract JSON from text:', innerError);
              data = comparisonData.comparison;
            }
          }
        } else {
          data = comparisonData.comparison;
        }
      }
      
      // If data is already in the right format, use it directly
      console.log('Data before transformation:', data);
      
      // Handle when it's a single object with required properties
      if (data && typeof data === 'object' && !Array.isArray(data) && 
          (data.title || data.fda_requirement_summary || data.user_summary || data.potential_issues)) {
        console.log('Processing single object data with exact fields');
        
        // Check if potential_issues is an array of objects with the new structure
        if (Array.isArray(data.potential_issues) && data.potential_issues.length > 0) {
          // Check if the first item has the new structure (is an object with issue property)
          if (typeof data.potential_issues[0] === 'object' && 'issue' in data.potential_issues[0]) {
            // New format - each potential issue has its own FDA requirement and SOP detail
            const typedIssues = data.potential_issues as PotentialIssue[];
            transformedData = typedIssues.map((issueObj, index) => {
              return {
                id: index + 1,
                title: issueObj.category || generateTitleFromIssue(issueObj.issue, data.title || "SOP Analysis"),
                fdaSummary: issueObj.fda_requirement || data.fda_requirement_summary || "",
                sopSummary: issueObj.sop_detail || data.user_summary || "",
                issues: [issueObj.issue],
                isCompliant: false
              };
            });
          } else {
            // Old format - array of strings
            transformedData = data.potential_issues.map((issue: string, index) => {
              const title = generateTitleFromIssue(issue, data.title || "SOP Analysis");
              const fdaRequirement = extractFDARequirement(issue, data.fda_requirement_summary || "");
              const sopDetail = extractSOPDetail(issue, data.user_summary || "");
              
              return {
                id: index + 1,
                title: title,
                fdaSummary: fdaRequirement,
                sopSummary: sopDetail,
                issues: [issue],
                isCompliant: false
              };
            });
          }
        } else {
          // If no issues, create a single compliant card
          transformedData = [{
            id: 1,
            title: data.title || "SOP Analysis",
            fdaSummary: data.fda_requirement_summary || "",
            sopSummary: data.user_summary || "",
            issues: [],
            isCompliant: true
          }];
        }
      } 
      // Handle when it's an array
      else if (Array.isArray(data)) {
        console.log('Processing array data with length:', data.length);
        
        // Flatten the array into separate cards for each issue
        let itemId = 1;
        transformedData = data.flatMap((item, itemIndex) => {
          if (Array.isArray(item.potential_issues) && item.potential_issues.length > 0) {
            // Check if using new format (objects with issue property)
            if (typeof item.potential_issues[0] === 'object' && 'issue' in item.potential_issues[0]) {
              const typedIssues = item.potential_issues as PotentialIssue[];
              return typedIssues.map((issueObj) => ({
                id: itemId++,
                title: issueObj.category || generateTitleFromIssue(issueObj.issue, item.title || `Item ${itemIndex + 1}`),
                fdaSummary: issueObj.fda_requirement || item.fda_requirement_summary || "",
                sopSummary: issueObj.sop_detail || item.user_summary || "",
                issues: [issueObj.issue],
                isCompliant: false
              }));
            } else {
              // Old format - array of strings
              return item.potential_issues.map((issue: string) => {
                const title = generateTitleFromIssue(issue, item.title || `Item ${itemIndex + 1}`);
                const fdaRequirement = extractFDARequirement(issue, item.fda_requirement_summary || "");
                const sopDetail = extractSOPDetail(issue, item.user_summary || "");
                
                return {
                  id: itemId++,
                  title: title,
                  fdaSummary: fdaRequirement,
                  sopSummary: sopDetail,
                  issues: [issue],
                  isCompliant: false
                };
              });
            }
          } else {
            // If no issues, create a single compliant card
            return [{
              id: itemId++,
              title: item.title || `Item ${itemIndex + 1}`,
              fdaSummary: item.fda_requirement_summary || "",
              sopSummary: item.user_summary || "",
              issues: [],
              isCompliant: true
            }];
          }
        });
      }
      // Handle string data
      else if (typeof data === 'string') {
        console.log('Processing string data');
        // Try to extract JSON from the string
        try {
          const potentialJsonMatch = data.match(/\{[\s\S]*\}/);
          if (potentialJsonMatch) {
            const jsonStr = potentialJsonMatch[0];
            const parsedData = JSON.parse(jsonStr);
            console.log('Extracted JSON from string:', parsedData);
            
            // Check if using new format (objects with issue property)
            if (Array.isArray(parsedData.potential_issues) && 
                parsedData.potential_issues.length > 0 &&
                typeof parsedData.potential_issues[0] === 'object' && 
                'issue' in parsedData.potential_issues[0]) {
              
              const typedIssues = parsedData.potential_issues as PotentialIssue[];
              transformedData = typedIssues.map((issueObj, index) => ({
                id: index + 1,
                title: issueObj.category || generateTitleFromIssue(issueObj.issue, parsedData.title || "SOP Analysis"),
                fdaSummary: issueObj.fda_requirement || parsedData.fda_requirement_summary || "",
                sopSummary: issueObj.sop_detail || parsedData.user_summary || "",
                issues: [issueObj.issue],
                isCompliant: false
              }));
            } else if (Array.isArray(parsedData.potential_issues)) {
              // Old format - array of strings
              transformedData = parsedData.potential_issues.map((issue: string, index) => {
                const title = generateTitleFromIssue(issue, parsedData.title || "SOP Analysis");
                const fdaRequirement = extractFDARequirement(issue, parsedData.fda_requirement_summary || "");
                const sopDetail = extractSOPDetail(issue, parsedData.user_summary || "");
                
                return {
                  id: index + 1,
                  title: title,
                  fdaSummary: fdaRequirement,
                  sopSummary: sopDetail,
                  issues: [issue],
                  isCompliant: false
                };
              });
            } else {
              throw new Error('No potential issues found in the parsed data');
            }
          } else {
            throw new Error('No JSON pattern found in string');
          }
        } catch (e) {
          console.error('Failed to extract JSON from string:', e);
          // Fallback to placeholder
          transformedData = [{
            id: 1,
            title: "SOP Analysis",
            fdaSummary: "Unable to extract FDA requirements from data",
            sopSummary: "Unable to extract SOP details from data",
            issues: ["Please check the server response format"],
            isCompliant: false
          }];
        }
      }
      
      if (transformedData.length > 0) {
        console.log('Setting comparison results:', transformedData);
        setComparisonResults(transformedData);
      } else {
        console.error('Could not transform data into valid format:', data);
        toast.error('Failed to process comparison data format');
      }
    } catch (error) {
      console.error('Error processing comparison data:', error);
      toast.error('Failed to process comparison data');
    }
  }, [comparisonData]);
  
  const handleMakeActionable = async (item: ComparisonItem) => {
    if (item.issues.length === 0) {
      toast.info("No issues to convert to action items");
      return;
    }
    
    try {
      // For each issue, call the make_actionable API
      const newActionItems = await Promise.all(
        item.issues.map(async (issue, index) => {
          try {
            // Call the API to convert issue to actionable item
            const response = await fetch(API_ENDPOINTS.MAKE_ACTIONABLE, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ issue }),
            });
            
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            return {
              id: actionItems.length + index + 1,
              text: data.action || issue, // Use the API response or fallback to original issue
              completed: false
            };
          } catch (error) {
            console.error('Error making actionable:', error);
            // Fallback to original issue text if API fails
            return {
              id: actionItems.length + index + 1,
              text: `${item.title}: ${issue}`,
              completed: false
            };
          }
        })
      );
      
      setActionItems([...actionItems, ...newActionItems]);
      toast.success("Issues converted to action items");
    } catch (error) {
      console.error('Error in makeActionable:', error);
      // Fallback without API
      const newActionItems = item.issues.map((issue, index) => ({
        id: actionItems.length + index + 1,
        text: `${item.title}: ${issue}`,
        completed: false
      }));
      
      setActionItems([...actionItems, ...newActionItems]);
      toast.success("Issues converted to action items (offline mode)");
    }
  };
  
  const handleExport = (type: 'pdf' | 'csv') => {
    if (type === 'csv') {
      if (actionItems.length === 0) {
        toast.error('No action items to export');
        return;
      }
      
      // Create CSV content
      let csvContent = 'Item,Status\n';
      
      // Add each action item to the CSV
      actionItems.forEach(item => {
        // Escape quotes in text to prevent CSV format issues
        const escapedText = item.text.replace(/"/g, '""');
        const status = item.completed ? 'Completed' : 'Pending';
        csvContent += `"${escapedText}","${status}"\n`;
      });
      
      // Create a blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fda-compliance-action-items-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Action items exported as CSV');
    } else if (type === 'pdf') {
      // Keep this as placeholder for future PDF implementation
      toast.info('PDF export will be implemented in a future update');
    }
  };
  
  const toggleActionItem = (id: number) => {
    setActionItems(
      actionItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  // Update the handleAskQuestion function
  const handleAskQuestion = async () => {
    if (!sessionId) {
      toast.error('No active session. Please upload a document first.');
      return;
    }
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    const userQuestion = question.trim();
    
    // Immediately add the user's question to chat history
    setChatHistory(prev => [...prev, {
      question: userQuestion,
      answer: '' // Empty answer placeholder while loading
    }]);
    
    // Clear the question input right away
    setQuestion('');
    
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.ASK_SOP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: userQuestion
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the chat history with the answer
      setChatHistory(prev => 
        prev.map((item, index) => 
          index === prev.length - 1
            ? { ...item, answer: data.answer || 'Sorry, I could not find an answer to that question.' }
            : item
        )
      );
    } catch (error) {
      console.error('Error asking question:', error);
      // Update with error message
      setChatHistory(prev => 
        prev.map((item, index) => 
          index === prev.length - 1
            ? { ...item, answer: 'Sorry, there was an error processing your question.' }
            : item
        )
      );
      toast.error('Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (comparisonResults.length === 0 && !comparisonData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>FDA Compliance Analysis</CardTitle>
          <CardDescription>
            Upload a document to see compliance analysis results
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No analysis data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use the uploader to process a document
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FDA Compliance Analysis</CardTitle>
        <CardDescription>
          Comparison of your SOP document against FDA regulatory requirements
          {sessionId && <span className="text-xs mt-1 block">Session ID: {sessionId}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="comparison" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background">
            <TabsTrigger value="comparison" onClick={() => setActiveTab("comparison")}>Comparison Results</TabsTrigger>
            <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>Ask Questions</TabsTrigger>
            <TabsTrigger value="actionItems" onClick={() => setActiveTab("actionItems")}>Action Items {actionItems.length > 0 && <Badge variant="outline" className="ml-2">{actionItems.length}</Badge>}</TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto max-h-[65vh] pr-1">
            <TabsContent value="comparison" className="space-y-4 mt-4">
              {comparisonResults.map(item => (
                <Card key={item.id} className="overflow-hidden mb-4">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="mt-2">
                          {item.isCompliant ? (
                            <Badge className="bg-green-600 px-3 py-1 text-sm font-medium">
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Compliant
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Non-Compliant
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!item.isCompliant && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-white hover:bg-slate-100 border-slate-200 text-slate-800 font-medium"
                          onClick={() => handleMakeActionable(item)}
                        >
                          <span className="mr-1">+</span> Make Actionable
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">FDA Requirement:</p>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">{item.fdaSummary}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">Your SOP:</p>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">{item.sopSummary}</p>
                        </div>
                      </div>
                    </div>
                    
                    {item.issues.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-medium text-primary mb-2">Potential Issues:</p>
                        <div className="bg-red-50 p-3 rounded-md">
                          <ul className="list-disc pl-5 pr-2">
                            {item.issues.map((issue, idx) => (
                              <li key={idx} className="text-sm text-red-600">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="actionItems" className="mt-4">
              {actionItems.length > 0 ? (
                <div className="space-y-2">
                  {actionItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox 
                        id={`item-${item.id}`} 
                        checked={item.completed} 
                        onCheckedChange={() => toggleActionItem(item.id)} 
                      />
                      <Label 
                        htmlFor={`item-${item.id}`}
                        className={`flex-grow ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No action items yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Make Actionable" on comparison items to create tasks
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Updated Chat Interface tab */}
            <TabsContent value="chat" className="mt-4">
              <div className="flex flex-col space-y-4">
                <div 
                  ref={chatContainerRef}
                  className={`rounded-lg p-4 h-96 md:h-[400px] lg:h-[450px] overflow-y-auto flex flex-col space-y-6 ${
                    isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileText className={`h-12 w-12 mb-3 ${
                        isDarkTheme ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                      <p className={`text-lg ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                        No questions asked yet
                      </p>
                      <p className={`text-sm mt-2 ${
                        isDarkTheme ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Ask questions about your SOP or FDA regulations
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
                      <div key={index} className="space-y-3">
                        {/* User message (right aligned) */}
                        <div className="flex justify-end">
                          <div className={`max-w-[85%] p-4 rounded-lg rounded-tr-none ${
                            isDarkTheme 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            <p className="text-md">{chat.question}</p>
                          </div>
                        </div>
                        
                        {/* Assistant message (left aligned) */}
                        <div className="flex justify-start">
                          <div className={`max-w-[85%] p-4 rounded-lg rounded-tl-none ${
                            isDarkTheme 
                              ? 'bg-slate-700 text-slate-100' 
                              : 'bg-white border border-slate-200 text-slate-800'
                          }`}>
                            <div 
                              className="text-md prose-sm max-w-none leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatChatAnswer(chat.answer, isDarkTheme) 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about your SOP or FDA regulations..."
                    className={`flex-1 py-6 text-md ${
                      isDarkTheme 
                        ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' 
                        : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400'
                    }`}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
                  />
                  <Button 
                    onClick={handleAskQuestion} 
                    disabled={!sessionId || isLoading}
                    size="lg"
                    className={
                      isDarkTheme 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'bg-primary hover:bg-primary/90'
                    }
                  >
                    {isLoading ? 'Loading...' : (
                      <>
                        <span className="mr-2">Ask</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className={`text-xs ${
                  isDarkTheme ? 'text-slate-400' : 'text-muted-foreground'
                }`}>
                  Ask questions about your SOP document and FDA regulations. The system will search both sources to provide a comprehensive answer.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          {activeTab === "comparison" && (
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          )}
          {activeTab === "actionItems" && actionItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default ComparisonResults;