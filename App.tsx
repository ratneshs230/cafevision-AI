
import React, { useState, useCallback } from 'react';
import { AppState, CafeLayout, SiteAnalysis } from './types';
import Header from './components/Header';
import Button from './components/Button';
import { analyzeSite, generateLayouts, visualizeLayout, refineVisualization } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'upload',
    originalImage: null,
    analysis: null,
    layouts: [],
    selectedLayout: null,
    visualizedImage: null,
    isProcessing: false,
    error: null,
  });

  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ 
          ...prev, 
          originalImage: event.target?.result as string,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!state.originalImage) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const analysis = await analyzeSite(state.originalImage);
      const layouts = await generateLayouts(analysis, state.originalImage);
      setState(prev => ({ 
        ...prev, 
        analysis, 
        layouts, 
        step: 'layouts', 
        isProcessing: false 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Failed to analyze the image. Please try again.", isProcessing: false }));
      console.error(err);
    }
  };

  const selectLayout = async (layout: CafeLayout) => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, selectedLayout: layout, isProcessing: true, error: null }));
    try {
      const visualizedImage = await visualizeLayout(state.originalImage, layout.imagePrompt);
      setState(prev => ({ 
        ...prev, 
        visualizedImage, 
        step: 'visualization', 
        isProcessing: false 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Failed to generate visualization.", isProcessing: false }));
      console.error(err);
    }
  };

  const handleRefine = async () => {
    if (!state.visualizedImage || !refinementPrompt) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const newImage = await refineVisualization(state.visualizedImage, refinementPrompt);
      setState(prev => ({ 
        ...prev, 
        visualizedImage: newImage, 
        isProcessing: false 
      }));
      setRefinementPrompt('');
    } catch (err) {
      setState(prev => ({ ...prev, error: "Refinement failed. Try a different prompt.", isProcessing: false }));
      console.error(err);
    }
  };

  const reset = () => {
    setState({
      step: 'upload',
      originalImage: null,
      analysis: null,
      layouts: [],
      selectedLayout: null,
      visualizedImage: null,
      isProcessing: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {state.error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between">
            <p><i className="fas fa-exclamation-circle mr-2"></i>{state.error}</p>
            <button onClick={() => setState(p => ({...p, error: null}))}><i className="fas fa-times"></i></button>
          </div>
        )}

        {state.step === 'upload' && (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-serif text-amber-950 mb-6">Design Your Visionary Cafe</h2>
            <p className="text-xl text-amber-800/70 mb-12 max-w-2xl mx-auto">Upload a photo of your raw space. Our AI will analyze the architecture and generate stunning, tailored design concepts.</p>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed border-amber-200 bg-amber-50/50 flex flex-col items-center justify-center transition-all hover:border-amber-400 group-focus-within:ring-4 ring-amber-100">
                  {state.originalImage ? (
                    <img src={state.originalImage} alt="Raw space" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mb-4 text-3xl">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <p className="text-amber-900 font-medium">Click to upload site photo</p>
                      <p className="text-amber-700/60 text-sm mt-1">JPEG, PNG supported</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                  />
                </div>
                {state.originalImage && (
                  <button 
                    onClick={() => setState(prev => ({...prev, originalImage: null}))}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full text-red-500 shadow-md"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>

              <div className="text-left space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-bold text-amber-900">Upload Site Photo</h3>
                    <p className="text-amber-800/60">Capture your raw construction site or empty space.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-bold text-amber-900">AI Analysis</h3>
                    <p className="text-amber-800/60">We analyze dimensions, lighting, and style potential.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-bold text-amber-900">Generate Visuals</h3>
                    <p className="text-amber-800/60">Get 10 unique concepts and visualize them instantly.</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full md:w-auto text-lg py-4" 
                    onClick={startAnalysis} 
                    disabled={!state.originalImage || state.isProcessing}
                    isLoading={state.isProcessing}
                  >
                    Start Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.step === 'layouts' && (
          <div>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-serif text-amber-950 mb-2">Curated Design Layouts</h2>
                <p className="text-amber-800/70">Based on your space, we've generated 10 concepts across different styles.</p>
              </div>
              <Button variant="outline" onClick={reset}>
                <i className="fas fa-arrow-left"></i> Start Over
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.layouts.map((layout) => (
                <div 
                  key={layout.id} 
                  className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">
                      {layout.style}
                    </span>
                    <i className="fas fa-magic text-amber-300"></i>
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 mb-2">{layout.title}</h3>
                  <p className="text-amber-800/70 text-sm mb-6 flex-grow">{layout.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {layout.suggestedFeatures.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100">
                        {f}
                      </span>
                    ))}
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => selectLayout(layout)}
                    isLoading={state.isProcessing && state.selectedLayout?.id === layout.id}
                    disabled={state.isProcessing}
                  >
                    Visualize Concept
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.step === 'visualization' && state.visualizedImage && (
          <div className="max-w-6xl mx-auto">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-serif text-amber-950 mb-2">Final Visualization</h2>
                <p className="text-amber-800/70">Refine your {state.selectedLayout?.title} design with simple text prompts.</p>
              </div>
              <Button variant="outline" onClick={() => setState(p => ({...p, step: 'layouts'}))}>
                <i className="fas fa-th-large"></i> Back to Layouts
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center">
                  <img src={state.visualizedImage} alt="Visualization" className="w-full h-full object-cover" />
                  {state.isProcessing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                        <i className="fas fa-circle-notch fa-spin text-4xl text-amber-800"></i>
                        <p className="font-medium text-amber-950">Refining Design...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 items-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="text-amber-800 text-xl px-2">
                    <i className="fas fa-wand-magic-sparkles"></i>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Refine design (e.g. 'Add more plants', 'Change wall to brick', 'Make it brighter')" 
                    className="flex-grow bg-transparent border-none focus:ring-0 text-amber-950 placeholder:text-amber-400"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  />
                  <Button 
                    onClick={handleRefine} 
                    disabled={!refinementPrompt || state.isProcessing}
                    isLoading={state.isProcessing}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100">
                  <h3 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2 border-amber-50">Site Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase mb-1">Dimensions</p>
                      <p className="text-sm text-amber-900">{state.analysis?.dimensions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase mb-1">Architectural Features</p>
                      <ul className="text-sm text-amber-900 list-disc pl-4">
                        {state.analysis?.architecturalFeatures.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase mb-1">AI Recommendation</p>
                      <p className="text-sm text-amber-900 italic">"{state.analysis?.vibeRecommendation}"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100">
                  <h3 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2 border-amber-50">Concept Details</h3>
                  <p className="text-sm text-amber-800 mb-4">{state.selectedLayout?.description}</p>
                  <div className="space-y-2">
                    {state.selectedLayout?.suggestedFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-900">
                        <i className="fas fa-check-circle text-amber-400"></i>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full py-4" onClick={() => {
                  const link = document.createElement('a');
                  link.href = state.visualizedImage!;
                  link.download = `cafe-design-${state.selectedLayout?.id}.png`;
                  link.click();
                }}>
                  <i className="fas fa-download"></i> Download Export
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-amber-100/50 text-center text-amber-900/40 text-sm">
        <p>&copy; 2024 CafeVision AI. Powered by Gemini 3 & Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;
