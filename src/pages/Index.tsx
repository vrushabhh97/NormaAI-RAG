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
        <section className="pt-20 pb-16 md:pt-14 md:pb-14 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto max-w-5xl text-center space-y-8">
            <div className="space-y-4 animate-fade-in-down">
              <div className="flex items-center justify-center gap-3">
                <img src="/logo.png" alt="Norma Logo" width="50" height="50" />
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Norma</h1>
              </div>
              <span className="block text-2xl md:text-3xl mt-2 font-medium text-muted-foreground">
                  Compliance. Simplified.
                </span>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                Easily audit and improve your SOPs, policies, and internal documentation with AI-powered insights and real-time comparison against FDA and other regulatory standards.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Feature Section */}
        <section ref={featuresRef} className="py-16 md:py-12 px-2 md:px-6">
          <div className="container mx-auto max-w-8xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-norma-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17L4 12L9 7M15 17L20 12L15 7" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Compliance Checks</h3>
                <p className="text-muted-foreground">
                  Upload any policy document and get instant feedback on compliance with FDA and other regulations.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-norma-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12M12 8H12.01" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Gap Detection</h3>
                <p className="text-muted-foreground">
                  Automatically identifies missing, outdated, or unclear sections
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
                  Ask questions about your document or the regulation itself.
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

      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t py-4 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center">
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Developed by Vrushabh & Neha
                <a href="https://github.com/vrushabhh97/NormaAI-RAG" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0,0,256,256" className="footer-logo">
                    <g fill="#2563eb" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                      <g transform="scale(8.53333,8.53333)">
                        <path d="M15,3c-6.627,0 -12,5.373 -12,12c0,5.623 3.872,10.328 9.092,11.63c-0.056,-0.162 -0.092,-0.35 -0.092,-0.583v-2.051c-0.487,0 -1.303,0 -1.508,0c-0.821,0 -1.551,-0.353 -1.905,-1.009c-0.393,-0.729 -0.461,-1.844 -1.435,-2.526c-0.289,-0.227 -0.069,-0.486 0.264,-0.451c0.615,0.174 1.125,0.596 1.605,1.222c0.478,0.627 0.703,0.769 1.596,0.769c0.433,0 1.081,-0.025 1.691,-0.121c0.328,-0.833 0.895,-1.6 1.588,-1.962c-3.996,-0.411 -5.903,-2.399 -5.903,-5.098c0,-1.162 0.495,-2.286 1.336,-3.233c-0.276,-0.94 -0.623,-2.857 0.106,-3.587c1.798,0 2.885,1.166 3.146,1.481c0.896,-0.307 1.88,-0.481 2.914,-0.481c1.036,0 2.024,0.174 2.922,0.483c0.258,-0.313 1.346,-1.483 3.148,-1.483c0.732,0.731 0.381,2.656 0.102,3.594c0.836,0.945 1.328,2.066 1.328,3.226c0,2.697 -1.904,4.684 -5.894,5.097c1.098,0.573 1.899,2.183 1.899,3.396v2.734c0,0.104 -0.023,0.179 -0.035,0.268c4.676,-1.639 8.035,-6.079 8.035,-11.315c0,-6.627 -5.373,-12 -12,-12z"></path>
                      </g>
                    </g>
                  </svg>
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Powered by
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