'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CodeforcesVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHandle?: string;
  onSuccess: (verifiedHandle: string, data?: any) => void;
}

export default function CodeforcesVerificationModal({
  isOpen,
  onClose,
  initialHandle = '',
  onSuccess,
}: CodeforcesVerificationModalProps) {
  const [handle, setHandle] = useState(initialHandle);
  const [step, setStep] = useState<'input' | 'verify' | 'success'>(initialHandle ? 'verify' : 'input');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ expected: string; found: string } | null>(null);

  const handleGenerateCode = async (targetHandle?: string) => {
    const handleToUse = (targetHandle || handle).trim();
    if (!handleToUse) {
      setError('Please provide a Codeforces handle.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setErrorDetails(null);

    try {
      const res = await fetch('/api/student/codeforces/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          handle: handleToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate verification code.');
      }

      setVerificationCode(data.verificationCode);
      setHandle(data.handle);
      setStep('verify');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating code';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (initialHandle) {
      setHandle(initialHandle);
      // Auto-initiate code generation if initialHandle is passed and modal opens
      if (isOpen && !verificationCode) {
        handleGenerateCode(initialHandle);
      }
    }
  }, [isOpen, initialHandle]);

  useEffect(() => {
    if (!isOpen) {
      // Reset states when closed
      setError(null);
      setErrorDetails(null);
      setCopied(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyCode = async () => {
    if (!verificationCode) return;
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleVerifyProfile = async () => {
    if (!handle.trim() || !verificationCode) return;

    setIsVerifying(true);
    setError(null);
    setErrorDetails(null);

    try {
      const res = await fetch('/api/student/codeforces/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          handle: handle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrorDetails({
            expected: data.details.expected,
            found: data.details.found,
          });
        }
        throw new Error(data.error || 'Verification failed');
      }

      setStep('success');
      setTimeout(() => {
        onSuccess(data.handle, data);
        onClose();
      }, 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-[2.5rem] bg-white border border-onyx/10 shadow-2xl p-6 sm:p-8 relative custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-onyx/5 hover:bg-onyx/10 text-onyx/70 hover:text-onyx transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-tomato-jam/10 text-tomato-jam flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-onyx tracking-tight">
              Verify Codeforces Account
            </h3>
            <p className="text-xs text-onyx/60 font-semibold">
              Prove handle ownership via profile first name verification
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-tomato-jam/10 border border-tomato-jam/25 text-onyx text-xs font-semibold space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-tomato-jam">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {errorDetails && (
              <div className="mt-2 pt-2 border-t border-tomato-jam/20 text-[11px] space-y-1">
                <p>
                  <span className="text-onyx/70">Expected First Name:</span>{' '}
                  <span className="font-mono font-bold text-onyx px-1.5 py-0.5 rounded bg-white/70 border border-onyx/10">
                    {errorDetails.expected}
                  </span>
                </p>
                <p>
                  <span className="text-onyx/70">Found on Codeforces:</span>{' '}
                  <span className="font-mono font-bold text-tomato-jam px-1.5 py-0.5 rounded bg-white/70 border border-onyx/10">
                    {errorDetails.found}
                  </span>
                </p>
                <p className="text-onyx/80 mt-1">
                  Make sure you entered this exact text in your Codeforces profile and clicked <strong>Save changes</strong> at the bottom of the page.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: INPUT HANDLE */}
        {step === 'input' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-2">
                Codeforces Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. tourist, neal_wu"
                className="w-full px-4 py-3 rounded-2xl bg-[#FFF1D6]/60 border border-onyx/10 text-sm font-semibold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 placeholder:text-onyx/30"
              />
              <p className="text-[11px] text-onyx/60 mt-1.5">
                We will generate a unique verification code to paste into your Codeforces profile first name.
              </p>
            </div>

            <button
              type="button"
              disabled={isGenerating || !handle.trim()}
              onClick={() => handleGenerateCode()}
              className="w-full py-3.5 rounded-2xl bg-tomato-jam text-white text-sm font-black shadow-md hover:bg-[#D93D42] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Verification Code...
                </>
              ) : (
                <>
                  Continue to Verification
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: VERIFICATION CODE & INSTRUCTIONS */}
        {step === 'verify' && (
          <div className="space-y-5">
            {/* Target handle badge */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-onyx/5 border border-onyx/10 text-xs">
              <span className="text-onyx/60 font-semibold">Verifying Handle:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-onyx">@{handle}</span>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-[11px] font-bold text-tomato-jam hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Generated Code Box */}
            <div className="p-4 rounded-2xl bg-[#FFF1D6] border-2 border-dashed border-onyx/20 text-center space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-onyx/70">
                Your Unique Verification Code
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-tomato-jam selection:bg-tomato-jam/20">
                  {verificationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy verification code"
                  className="p-2 rounded-xl bg-white border border-onyx/10 hover:bg-onyx/5 active:scale-95 transition-all text-onyx shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-onyx/70" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-onyx/60 font-medium">
                {copied ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                  </span>
                ) : (
                  'Click copy and set this as your First Name on Codeforces'
                )}
              </p>
            </div>

            {/* Step-by-step instructions */}
            <div className="rounded-2xl bg-onyx/5 p-4 space-y-2.5 text-xs text-onyx">
              <p className="font-bold text-onyx uppercase tracking-wider text-[10px] text-onyx/70">
                How to verify (takes 30 seconds):
              </p>
              <ol className="space-y-2 list-decimal list-inside text-onyx/85 font-medium leading-relaxed">
                <li>
                  Open your{' '}
                  <a
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-tomato-jam underline inline-flex items-center gap-0.5 hover:text-[#D93D42]"
                  >
                    Codeforces Social Settings
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Paste <strong className="font-mono text-onyx">{verificationCode}</strong> into the{' '}
                  <strong>First name (in English)</strong> field.
                </li>
                <li>
                  Scroll down and click <strong>Save changes</strong> on Codeforces.
                </li>
                <li>
                  Click the <strong>Verify &amp; Link Profile</strong> button below.
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isGenerating || isVerifying}
                onClick={() => handleGenerateCode()}
                className="order-2 sm:order-1 px-4 py-3 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx/70 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                New Code
              </button>

              <button
                type="button"
                disabled={isVerifying || !verificationCode}
                onClick={handleVerifyProfile}
                className="order-1 sm:order-2 flex-1 py-3.5 rounded-2xl bg-tomato-jam text-white text-sm font-black shadow-md hover:bg-[#D93D42] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Codeforces Profile...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    I&apos;ve Added First Name - Verify
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xl font-black text-onyx">Ownership Verified!</h4>
              <p className="text-xs text-onyx/70 mt-1 font-semibold">
                Codeforces handle <strong className="font-mono text-emerald-700">@{handle}</strong> has been successfully verified and linked to your Nexus profile.
              </p>
            </div>
            <p className="text-[11px] text-onyx/50 italic">
              You may now restore your original first name on Codeforces if you wish.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
