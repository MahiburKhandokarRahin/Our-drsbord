import { useState } from 'react';
import { Copy, Check, FileText, Globe, Key, AlertTriangle, Play } from 'lucide-react';

interface AppsScriptPortalProps {
  customScriptUrl: string;
  isConnecting: boolean;
  onSaveScriptUrl: (url: string) => void;
  onDisableScriptUrl: () => void;
  onTestConnection: (url: string) => Promise<boolean>;
  onClearAllData: () => void;
}

export default function AppsScriptPortal({
  customScriptUrl,
  isConnecting,
  onSaveScriptUrl,
  onDisableScriptUrl,
  onTestConnection,
  onClearAllData
}: AppsScriptPortalProps) {
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  const [typedUrl, setTypedUrl] = useState(customScriptUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const codeGs = `/**
 * Cuteriaa Vibe Financial Dashboard - Google Apps Script Backend (Code.gs)
 * Paste this directly into the Apps Script editor.
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Cuteriaa Vibe Financial Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Full Code.gs available in the file tree at: /apps-script/Code.gs
// (You can copy the entire file from there for maximum size/stability!)
`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const verifyEndpoint = async () => {
    if (!typedUrl) return;
    setTestStatus('testing');
    const success = await onTestConnection(typedUrl);
    setTestStatus(success ? 'success' : 'failed');
  };

  return (
    <div className="space-y-8">
      
      {/* Alert Panel */}
      <div className="bg-emerald-500/5 border border-emerald-500/15 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4">
        <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400 shrink-0">
          <Globe size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Dual-Mode Hybrid Persistence Engine</h3>
          <p className="text-slate-300 text-xs leading-relaxed max-w-4xl">
            This dashboard operates in two modes: **Simulated Sheets Mode** (built-in spreadsheet emulator to test the application immediately) or **Live Google Sheets Mode** (connections are routed in real-time to your custom Google Spreadsheet via Google Apps Script's JSON Web API).
          </p>
        </div>
      </div>

      {/* Connection Console */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Live Google Sheets Synchronizer</h3>
          <p className="text-xs text-slate-400">Deploy your Apps Script as a web app, and insert the URL below to redirect all mutations to your physical spreadsheet.</p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Apps Script Deployment Web App URL</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              value={typedUrl}
              onChange={(e) => setTypedUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-3 px-4 text-xs font-mono text-emerald-400 focus:outline-none"
              placeholder="e.g. https://script.google.com/macros/s/AKfycb.../exec"
              disabled={isConnecting}
            />
            {customScriptUrl ? (
              <button 
                onClick={onDisableScriptUrl}
                className="bg-rose-500 hover:bg-rose-600 text-slate-950 font-semibold py-3 px-6 rounded-xl text-xs transition-all tracking-wide"
              >
                Disconnect API
              </button>
            ) : (
              <button 
                onClick={() => onSaveScriptUrl(typedUrl)}
                disabled={!typedUrl || testStatus === 'testing'}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs transition-all disabled:opacity-40 tracking-wide"
              >
                Activate Live Pipeline
              </button>
            )}
          </div>
        </div>

        {typedUrl && (
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={verifyEndpoint}
              disabled={testStatus === 'testing'}
              className="flex items-center text-xs font-semibold hover:text-white text-emerald-400 transition-all border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-lg"
            >
              <Play size={12} className="mr-2" />
              Verify Connection Endpoint
            </button>
            {testStatus === 'testing' && <span className="text-xs text-slate-400 animate-pulse">Pinging Web App gateway...</span>}
            {testStatus === 'success' && <span className="text-xs text-emerald-400 font-semibold font-mono">✔ Connection active. Synchronizer ready.</span>}
            {testStatus === 'failed' && <span className="text-xs text-rose-400 font-semibold font-mono">✘ Connection aborted (CORS or Invalid script Token).</span>}
          </div>
        )}
      </div>

      {/* Guide segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Setup documentation */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20"><FileText size={16} /></span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">Step-by-step deploy blueprints</h4>
          </div>

          <ol className="space-y-4 text-xs text-slate-400 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-slate-200">Prepare Spreadsheet:</strong> Create a Google Spreadsheet. In the top bar, rename sheet tabs to matching names: 
              <span className="text-emerald-400 font-mono ml-1 font-semibold">Users, Bank_Accounts, Expenses, Payments, Employee_Loans, Inventory</span>.
            </li>
            <li>
              <strong className="text-slate-200">Open Apps Script:</strong> Navigate to <span className="text-slate-300 font-medium">Extensions &gt; Apps Script</span> in your spreadsheet.
            </li>
            <li>
              <strong className="text-slate-200">Paste Code.gs:</strong> Replace all file contents in <code className="text-emerald-400">Code.gs</code> with the code provided in the left panel.
            </li>
            <li>
              <strong className="text-slate-200">Paste Index.html:</strong> Create an HTML file named <code className="text-emerald-400">Index.html</code> in Apps Script and paste the template.
            </li>
            <li>
              <strong className="text-slate-200">Deploy as Web App:</strong> Click <span className="text-slate-300 font-medium">Deploy &gt; New Deployment</span>. Select <strong className="text-white">Web App</strong>, change Access to <strong className="text-white">"Anyone"</strong>, and executing as <strong className="text-white">"Me"</strong>. Confirm access permissions of Drive/Sheets!
            </li>
            <li>
              <strong className="text-slate-200">Link Web App:</strong> Copy the Web App Executable URL and paste it into the Synchronizer above!
            </li>
          </ol>
        </div>

        {/* Code view */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Deploy Code.gs Snippet</h4>
            <button 
              onClick={() => copyToClipboard(codeGs, 'code')}
              className="p-1.5 bg-slate-850 border border-slate-750 text-slate-400 hover:text-white rounded-lg transition-all"
              title="Copy Code"
            >
              {copiedState['code'] ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-slate-400">The backend manages secure authorization, Google Drive receipt parsing/saving, structural bank ledger additions/deductions, and loan repayments automatically.</p>
          <pre className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 border border-slate-850">
            {codeGs}
          </pre>
          <div className="text-[10px] text-amber-400 bg-amber-400/5 border border-amber-400/10 p-3 rounded-lg flex items-center">
            <AlertTriangle className="mr-2 shrink-0" size={14} />
            Tip: Complete, structured full files <code className="text-emerald-400 px-1 font-semibold">Code.gs</code> and <code className="text-emerald-400 px-1 font-semibold">Index.html</code> are created inside your file tree in <code className="text-slate-300">/apps-script/</code> for ready-to-run use!
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400">Danger Zone</h4>
                <p className="text-[10px] text-slate-500 mt-1">Permanently purge all financial records and inventory.</p>
              </div>
              <button 
                onClick={onClearAllData}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:cursor-pointer"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
