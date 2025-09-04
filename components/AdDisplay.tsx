import React, { useState } from 'react';
import { AdScript } from '../types';
import { CopyIcon, CheckIcon, RedoIcon, FilmIcon, DownloadIcon, AlertTriangleIcon } from './icons';
import Loader from './Loader';

interface AdDisplayProps {
  adScript: AdScript;
  onReset: () => void;
  productImage: string;
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  videoLoadingMessage: string;
  videoUrl: string | null;
  videoError: string | null;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ 
    adScript, onReset, productImage, onGenerateVideo, isVideoLoading, videoLoadingMessage, videoUrl, videoError 
}) => {
  const [copied, setCopied] = useState(false);

  const formatScriptForCopy = (script: AdScript): string => {
    let text = `Title: ${script.title}\n`;
    text += `Tagline: ${script.tagline}\n\n`;
    text += "--- SCRIPT ---\n\n";

    script.scenes.forEach(scene => {
      text += `SCENE ${scene.sceneNumber}\n`;
      text += `SETTING: ${scene.setting}\n`;
      text += `ACTION: ${scene.action}\n`;
      text += `DIALOGUE: ${scene.dialogue}\n`;
      text += `SOUND: ${scene.sound}\n\n`;
    });

    return text;
  };

  const handleCopy = () => {
    const scriptText = formatScriptForCopy(adScript);
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="p-4 sm:p-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <img src={productImage} alt="Product" className="rounded-lg shadow-lg w-full h-auto object-contain max-h-80" />
        </div>
        <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-light to-purple-400 text-transparent bg-clip-text">
                {adScript.title}
            </h2>
            <p className="text-xl mt-2 text-medium-text italic">"{adScript.tagline}"</p>
            <div className="flex flex-wrap gap-4 mt-6">
                 <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                    <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={onGenerateVideo}
                    disabled={isVideoLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <FilmIcon className="h-5 w-5" />
                    <span>Generate Video</span>
                  </button>
                  <button
                    onClick={onReset}
                    className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-light text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <RedoIcon className="h-5 w-5" />
                    <span>New Script</span>
                  </button>
            </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="my-8">
        {isVideoLoading && (
            <div className="p-8 min-h-[250px] flex flex-col items-center justify-center bg-gray-900/50 border border-dark-border rounded-lg text-center">
              <Loader />
              <p className="mt-4 text-lg text-light-text">{videoLoadingMessage}</p>
            </div>
        )}
        {videoError && !isVideoLoading && (
            <div className="p-6 bg-red-900/50 border border-red-500 rounded-lg flex flex-col items-center justify-center text-center">
                <AlertTriangleIcon className="h-10 w-10 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-red-300 mb-2">Video Generation Failed</h3>
                <p className="text-red-400">{videoError}</p>
                 <button onClick={onGenerateVideo} className="mt-6 bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Retry Video Generation
                </button>
            </div>
        )}
        {videoUrl && !isVideoLoading && (
             <div className="bg-gray-900/50 p-4 rounded-lg border border-dark-border">
                <h3 className="text-xl font-bold text-light-text mb-4 text-center">Your Video Ad is Ready!</h3>
                <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg mb-4" />
                <a
                    href={videoUrl}
                    download={`ad-video-${adScript.title.replace(/\s+/g, '-')}.mp4`}
                    className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span>Download Video</span>
                </a>
            </div>
        )}
      </div>
      
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-light-text border-b border-dark-border pb-2">Commercial Script</h3>
        {adScript.scenes.map((scene) => (
          <div key={scene.sceneNumber} className="bg-gray-900/50 p-6 rounded-lg border border-dark-border">
            <h4 className="text-lg font-bold text-brand-purple-light mb-4">SCENE {scene.sceneNumber}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                    <strong className="block text-medium-text">Setting:</strong>
                    <p>{scene.setting}</p>
                </div>
                 <div>
                    <strong className="block text-medium-text">Sound:</strong>
                    <p>{scene.sound}</p>
                </div>
                <div className="sm:col-span-2">
                    <strong className="block text-medium-text">Action:</strong>
                    <p>{scene.action}</p>
                </div>
                 <div className="sm:col-span-2">
                    <strong className="block text-medium-text">Dialogue / Voiceover:</strong>
                    <p className="italic">{scene.dialogue}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdDisplay;