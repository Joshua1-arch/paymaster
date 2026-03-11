'use client';

import { useState, useEffect } from 'react';
import { WalletConnectProvider, useWalletConnect } from '@btc-vision/walletconnect';
import { LayoutGrid, Copy, Info, Sparkles, Gauge, ShieldCheck, Bitcoin, User, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function PaymasterApp() {
  const {
    openConnectModal,
    disconnect,
    walletAddress,
    connecting,
    walletBalance,
    walletInstance
  } = useWalletConnect();

  const [status, setStatus] = useState<'idle' | 'signing' | 'relaying' | 'success' | 'error'>('idle');
  const [txid, setTxid] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const claimableAmount = 5000;
  const networkGasFee = 15;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaim = async () => {
    if (!walletInstance || !walletAddress) {
        setErrorMsg('Wallet not connected or not ready.');
        return;
    }

    setStatus('signing');
    setErrorMsg('');
    
    try {
      // 1. Prompt real signed message from connected wallet
      const messageToSign = `Gasless claim request for ${claimableAmount} tokens.\nNonce: ${0}`;
      const signature = await walletInstance.signMessage(messageToSign);

      setStatus('relaying');

      // 2. Submit signed payload to the relayer
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: walletAddress,
          claimAmount: claimableAmount,
          nonce: 0,
          signature: signature,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to relay transaction');

      // 3. Success state UI updates
      setTxid(data.txid);
      setStatus('success');
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'An unknown error occurred by the wallet or relayer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0908] text-zinc-300 font-sans flex flex-col items-center selection:bg-orange-500/30">
      
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[#292318] bg-[#0B0908]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="OP_NET Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="font-bold text-lg tracking-wide hidden sm:block">
            <span className="text-zinc-100">OP_NET</span> <span className="text-orange-500">DEFENDER</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!walletAddress ? (
            <button 
              onClick={openConnectModal}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 text-orange-500 text-sm font-semibold hover:bg-orange-500/10 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              {connecting ? 'Connecting...' : 'Connect OP_WALLET'}
            </button>
          ) : (
            <button 
              onClick={disconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
            <User className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-4 py-12 flex flex-col items-center flex-1">
        
        {/* Central Dashboard Card */}
        <div className="w-full max-w-lg bg-[#110E0B] border border-[#292318] rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Overview</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-100 mb-8 tracking-tight">Token Claim Dashboard</h2>

          {/* Connected Address Box */}
          <div className="bg-[#181410] border border-[#292318] rounded-2xl p-4 flex justify-between items-center mb-8">
            <div className="overflow-hidden">
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Connected Address</label>
              <div className="font-mono text-zinc-300 truncate">
                {walletAddress ? (
                  `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}`
                ) : (
                  <span className="text-zinc-600">Not Connected</span>
                )}
              </div>
            </div>
            {walletAddress && (
              <button 
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl bg-[#201B15] border border-[#292318] flex items-center justify-center text-orange-500 hover:bg-[#2A231C] transition-colors shrink-0 tooltip"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="relative border-t border-[#292318] mx-[-2.5rem] px-[2.5rem] pt-8 mb-8 text-center">
            {/* Faint inset shadow line */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/[0.02]" />
            
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Claimable Balance</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl sm:text-7xl font-black text-orange-500 tracking-tighter drop-shadow-sm">
                5,000
              </span>
              <span className="text-xl sm:text-2xl font-bold text-orange-500/80">TKN</span>
            </div>
          </div>

          {/* Gasless Info Box */}
          <div className="bg-[#1C130A] border rounded-2xl p-5 mb-8 border-orange-500/20 flex gap-4">
            <div className="shrink-0">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                <Info className="w-4 h-4 text-[#1C130A]" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-500 mb-1">Gasless Transaction Active</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                A 15 TKN relayer fee will be deducted from your final claim to cover Bitcoin L1 network gas. <strong className="text-zinc-100 font-bold whitespace-nowrap">No BTC required.</strong>
              </p>
            </div>
          </div>

          {/* Status Displays */}
          {status === 'success' ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="text-green-500 font-bold text-xl mb-2">Claim Successful!</h3>
              <p className="text-xs text-zinc-400 font-mono break-all opacity-80 mb-4">{txid}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="text-xs font-bold text-green-500 hover:text-green-400 uppercase tracking-wider"
              >
                Claim More
              </button>
            </div>
          ) : status === 'error' ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-red-500 font-bold text-xl mb-2">Transaction Failed</h3>
              <p className="text-sm text-red-500/80 mb-4">{errorMsg}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={status !== 'idle' || !walletAddress}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all duration-300
                ${(!walletAddress) 
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-[#292318]' 
                  : status !== 'idle'
                    ? 'bg-orange-600/50 text-orange-200 cursor-wait'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-[#130E07] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {status === 'signing' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Awaiting Signature...</>
              ) : status === 'relaying' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Relaying Transaction...</>
              ) : (
                <>Sign Free Claim Message <Sparkles className="w-5 h-5 fill-current" /></>
              )}
            </button>
          )}

          <div className="text-[10px] sm:text-xs font-bold text-zinc-600 text-center tracking-[0.2em] mt-8 uppercase">
            Powered by OP_NET Gasless Paymaster
          </div>
        </div>

        {/* Feature Cards Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16 pb-8">
          <div className="bg-[#120F0C] border border-[#292318] rounded-[1.5rem] p-6 sm:p-8">
            <Gauge className="w-6 h-6 text-orange-500 mb-4" />
            <h3 className="text-sm font-bold text-zinc-100 mb-2">Instant Relaying</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">Transaction processed within the next Bitcoin block.</p>
          </div>
          <div className="bg-[#120F0C] border border-[#292318] rounded-[1.5rem] p-6 sm:p-8">
            <ShieldCheck className="w-6 h-6 text-orange-500 mb-4" />
            <h3 className="text-sm font-bold text-zinc-100 mb-2">Secure Sign</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">End-to-end encryption for all message relaying.</p>
          </div>
          <div className="bg-[#120F0C] border border-[#292318] rounded-[1.5rem] p-6 sm:p-8">
            <Bitcoin className="w-6 h-6 text-orange-500 mb-4" />
            <h3 className="text-sm font-bold text-zinc-100 mb-2">0 BTC Needed</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">Fees are paid entirely in the native protocol token.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 border-t border-[#292318] mt-auto text-xs font-medium text-zinc-600">
        &copy; 2024 OP_NET Protocol. All rights reserved.
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WalletConnectProvider theme="dark">
      <PaymasterApp />
    </WalletConnectProvider>
  );
}
