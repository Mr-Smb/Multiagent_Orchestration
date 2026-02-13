import React, { useState, useEffect } from 'react';
import { Mic, Lock, ShieldCheck, Fingerprint, Activity } from 'lucide-react';
import clsx from 'clsx';

interface VoiceAuthModalProps {
  isOpen: boolean;
  onAuthenticate: () => void;
}

const VoiceAuthModal: React.FC<VoiceAuthModalProps> = ({ isOpen, onAuthenticate }) => {
  const [step, setStep] = useState<'prompt' | 'processing' | 'verifying' | 'success'>('prompt');

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
    }
  }, [isOpen]);

  const startAuthentication = () => {
    setStep('processing');
    // Simulate processing delays for UI feedback
    setTimeout(() => {
      setStep('verifying');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onAuthenticate();
        }, 800);
      }, 1500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-dark-surface border border-dark-border rounded-lg p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-2",
            step === 'prompt' ? "bg-slate-800 border-slate-600 text-slate-400" :
            step === 'processing' ? "bg-brand-900/50 border-brand-500 text-brand-500 animate-pulse" :
            step === 'verifying' ? "bg-indigo-900/50 border-indigo-500 text-indigo-500" :
            "bg-emerald-900/50 border-emerald-500 text-emerald-500"
          )}>
            {step === 'prompt' && <Lock size={32} />}
            {step === 'processing' && <Mic size={32} />}
            {step === 'verifying' && <Activity size={32} className="animate-spin" />}
            {step === 'success' && <ShieldCheck size={32} />}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {step === 'prompt' ? "System Access" :
               step === 'processing' ? "Listening..." :
               step === 'verifying' ? "Verifying..." :
               "Access Granted"}
            </h2>
            <p className="text-gray-400 text-sm">
              {step === 'prompt' && "Administrator authentication required."}
              {step === 'processing' && "Please confirm your identity."}
              {step === 'verifying' && "Checking credentials..."}
              {step === 'success' && "Redirecting to dashboard..."}
            </p>
          </div>

          {step === 'prompt' && (
            <div className="w-full">
                <button
                onClick={startAuthentication}
                className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-3"
                >
                <Mic size={18} />
                Authenticate
                </button>
            </div>
          )}

          {(step === 'processing' || step === 'verifying') && (
             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 animate-[pulse_1s_ease-in-out_infinite] w-2/3 mx-auto rounded-full"></div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAuthModal;