import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AdScript } from './types';
import { generateAdScript, generateAdVideo } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import AdDisplay from './components/AdDisplay';
import Loader from './components/Loader';
import { SparklesIcon, AlertTriangleIcon, AppLogoIcon } from './components/icons';

const LOADING_MESSAGES = [
  "Warming up the virtual cameras...",
  "Storyboarding your vision...",
  "Setting up the digital lighting...",
  "Directing the AI actors...",
  "Rendering the first cut...",
  "Adding special effects and sound...",
  "Finalizing the masterpiece...",
  "This can take a few minutes, thanks for your patience!",
];


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [adScript, setAdScript] = useState<AdScript | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Video generation state
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if(loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    handleReset(); // Reset everything when a new file is selected
  }, []);

  const handleGenerateScript = async () => {
    if (!imageFile) {
      setError('Please upload a product image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAdScript(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type;
      const result = await generateAdScript(base64Image, mimeType, productDescription);
      setAdScript(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
      if (!adScript || !imageFile) {
        setVideoError("Cannot generate video without an ad script and product image.");
        return;
      }
      
      setIsVideoLoading(true);
      setVideoError(null);
      setVideoUrl(null);
      setVideoLoadingMessage(LOADING_MESSAGES[0]);

      // Start cycling through loading messages
      loadingIntervalRef.current = setInterval(() => {
        setVideoLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 5000);

      try {
        const sceneDescriptions = adScript.scenes.map(s => s.action).join('. ');
        const videoPrompt = `
          Create a dynamic, visually stunning 30-second commercial video based on this concept.
          Title: ${adScript.title}
          Tagline: ${adScript.tagline}
          Key Visuals: ${sceneDescriptions}
          The style should be modern, energetic, and cinematic, matching the product in the provided image.
        `;
        
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type;
        const resultUrl = await generateAdVideo(videoPrompt, base64Image, mimeType);
        setVideoUrl(resultUrl);

      } catch (err) {
          console.error(err);
          setVideoError(err instanceof Error ? err.message : 'An unknown error occurred while generating the video.');
      } finally {
          setIsVideoLoading(false);
          if(loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
          }
      }
  };

  const handleReset = () => {
    // Don't reset image if we are just creating a new ad for the same image
    //setImageFile(null);
    //setImagePreview(null);
    setProductDescription('');
    setAdScript(null);
    setError(null);
    setIsLoading(false);
    setVideoUrl(null);
    setVideoError(null);
    setIsVideoLoading(false);
    if(loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
    }
  }
  
  const handleHardReset = () => {
      handleReset();
      setImageFile(null);
      setImagePreview(null);
  }

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <AppLogoIcon className="h-12 w-12 text-brand-purple" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
              AI Ad Studio
            </h1>
          </div>
          <p className="text-lg text-medium-text max-w-2xl mx-auto">
            From Picture to Pitch to Production. Generate ad scripts and videos in seconds.
          </p>
        </header>

        <main className="bg-dark-card rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {!adScript && !isLoading && (
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <ImageUploader onFileSelect={handleFileSelect} imagePreview={imagePreview} onClear={handleHardReset} />
              </div>
              <div className="flex flex-col justify-center gap-6">
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-medium-text mb-2">
                      Product Description (Optional, but helps!)
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      className="w-full bg-gray-900/50 border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition duration-200 placeholder:text-gray-500"
                      placeholder="e.g., A sleek, wireless headphone with noise-cancellation and 20-hour battery life."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      disabled={!imageFile}
                    />
                 </div>
                <button
                  onClick={handleGenerateScript}
                  disabled={!imageFile || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-light disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/20"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Generate Script</span>
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
              <Loader />
              <p className="mt-4 text-lg text-medium-text animate-pulse-fast">Generating your masterpiece...</p>
            </div>
          )}

          {error && !isLoading && (
             <div className="m-8 p-6 bg-red-900/50 border border-red-500 rounded-lg flex flex-col items-center justify-center text-center">
                <AlertTriangleIcon className="h-10 w-10 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-red-300 mb-2">Oops! Something went wrong.</h3>
                <p className="text-red-400">{error}</p>
                 <button onClick={handleHardReset} className="mt-6 bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Try Again
                </button>
            </div>
          )}

          {adScript && !isLoading && (
            <AdDisplay 
              adScript={adScript} 
              onReset={handleReset} 
              productImage={imagePreview!} 
              onGenerateVideo={handleGenerateVideo}
              isVideoLoading={isVideoLoading}
              videoLoadingMessage={videoLoadingMessage}
              videoUrl={videoUrl}
              videoError={videoError}
            />
          )}
        </main>
        
        <footer className="text-center mt-10 text-medium-text text-sm">
            <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
