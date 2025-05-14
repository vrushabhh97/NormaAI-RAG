import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Paperclip, Send, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  sessionId: string | null;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm Norma, your FDA compliance assistant. How can I help you with your SOP document today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update initial message when sessionId changes
  useEffect(() => {
    if (sessionId) {
      setMessages([
        {
          id: 1,
          content: `Hello! I'm Norma, your FDA compliance assistant. I'm ready to answer questions about your uploaded SOP document (Session: ${sessionId})`,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, [sessionId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!sessionId) {
      toast.error('Please upload a document first');
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call the backend API to get response
      const response = await fetch(API_ENDPOINTS.ASK_SOP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: input
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiResponse: Message = {
        id: messages.length + 2,
        content: data.answer || "Sorry, I couldn't find an answer to that question in your SOP document.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error asking question:', error);
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full h-full flex flex-col min-h-[600px] lg:min-h-[700px]">
      <CardHeader className="pb-3">
        <CardTitle>Ask About Your SOP</CardTitle>
        <CardDescription>
          Ask questions about your uploaded SOP document and get AI-powered insights
          {!sessionId && (
            <span className="mt-2 text-red-500 flex items-center gap-1 text-sm">
              <AlertCircle className="h-4 w-4" /> 
              No document uploaded. Please upload a document first.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-4 pt-0 pb-4 h-[calc(100%-10rem)]">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.sender === 'ai' && (
                    <div className="rounded-full bg-norma-400 p-1.5 mt-0.5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="white"/>
                      </svg>
                    </div>
                  )}
                  {message.sender === 'user' && <User className="w-5 h-5 mt-0.5 text-primary-foreground" />}
                  <div>
                    <p className={`text-md leading-relaxed ${message.sender === 'user' ? 'text-primary-foreground' : ''}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-4 bg-muted">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-norma-400 p-1.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-muted-foreground/60 rounded-full animate-bounce delay-75"></div>
                    <div className="w-3 h-3 bg-muted-foreground/60 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
        
        {showContext && (
          <div className="mt-4 p-3 bg-muted/50 border rounded-lg text-sm">
            <p className="font-medium mb-1">Session Info:</p>
            <p className="text-muted-foreground">
              {sessionId ? `Using session: ${sessionId}` : 'No active session'}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="w-full space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-context" checked={showContext} onCheckedChange={setShowContext} />
            <Label htmlFor="show-context">Show session info</Label>
          </div>
          
          <div className="flex w-full items-center space-x-2">
            <Input
              className="text-md py-6"
              placeholder={sessionId ? "Ask about your SOP document..." : "Upload a document first..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={!sessionId || isLoading}
            />
            <Button 
              type="button" 
              size="lg"
              onClick={handleSend} 
              disabled={!sessionId || isLoading || !input.trim()}
            >
              {isLoading ? 'Sending...' : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatInterface;