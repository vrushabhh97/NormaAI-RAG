import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto max-w-5xl text-center space-y-8">
            <div className="space-y-4 animate-fade-in-down">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Norma
                <span className="block text-2xl md:text-3xl mt-2 font-medium text-muted-foreground">
                  Your FDA Compliance Assistant
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                Streamline SOP compliance checks with AI-powered analysis and automated comparison against FDA regulations
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
              <Button variant="outline" size="lg" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </div>
            
            <div className="pt-8 flex justify-center">
              <button onClick={scrollToFeatures} className="scroll-indicator">
                <div className="scroll-dot"></div>
              </button>
            </div>
          </div>
        </section>
        
        {/* Feature Section */}
        <section ref={featuresRef} className="py-16 md:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simplify FDA Compliance
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Norma helps medical professionals ensure compliance with FDA regulations through AI-powered document analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-norma-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17L4 12L9 7M15 17L20 12L15 7" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Intelligent Comparison</h3>
                <p className="text-muted-foreground">
                  Compare your SOPs against FDA regulations, with AI highlighting potential compliance issues
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-norma-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12M12 8H12.01" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Q&A</h3>
                <p className="text-muted-foreground">
                  Ask questions about your SOPs and get clear answers with regulatory context
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-norma-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Actionable Tasks</h3>
                <p className="text-muted-foreground">
                  Convert compliance issues into checklist items to track and resolve
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-norma-700 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to streamline your compliance process?
            </h2>
            <p className="text-lg text-norma-100 max-w-2xl mx-auto mb-8">
              Get started with Norma today and ensure your SOPs meet FDA requirements
            </p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="px-8">
                Try Norma Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="rounded-full bg-primary p-1 mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="white"/>
                </svg>
              </div>
              <span className="text-lg font-bold">Norma</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Powered by AI
              </div>
              <div className="flex items-center gap-2">
                <Badge>OpenAI</Badge>
                <Badge>Pinecone</Badge>
              </div>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;