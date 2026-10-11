import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, Mountain, Download, LoaderCircle, Printer, Scissors, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { booking, defaultReceipt, exportReceipt, receiptTotal, type ReceiptData } from "@/lib/receipt";

function Receipt({ data }: { data: ReceiptData }) {
  return (
    <article className="receipt-paper" aria-label="Booking confirmation">
      <div className="receipt-brand">
        <div className="brand-topline"><Mountain size={20} strokeWidth={1.5} /><span>BOOKING CONFIRMATION</span></div>
        <h2>{data.brand}</h2>
        <div className="brand-bottomline"><span>{data.tagline}</span><ArrowUpRight size={15} /></div>
      </div>
      <div className="receipt-body">
        <div className="receipt-intro"><span>{booking.intro}</span></div>
        <div className="receipt-rule" />
        <dl className="order-meta">
          {booking.metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === "STATUS" ? "paid" : ""}>{label === "STATUS" && <Check size={10} />}{value}</dd></div>)}
        </dl>
        <div className="receipt-rule" />
        <div className="item-heading"><span>QTY / PACKAGE</span><span>AMT</span></div>
        <div className="receipt-items">{data.items.map((item) => <div key={item.id}><span className="item-qty">{item.qty}×</span><span className="item-name">{item.desc}</span><span>${(item.qty * item.price).toFixed(2)}</span></div>)}</div>
        <div className="receipt-rule" />
        <div className="receipt-total"><span>TOTAL</span><strong>${receiptTotal(data).toFixed(2)}</strong></div>
        <div className="receipt-thanks">Your journey is confirmed.<br /><span>See you in the Himalayas.</span></div>
        <div className="barcode" aria-hidden="true" />
        <div className="barcode-number">8 4 2 9 0 0 1 7 5 0</div>
      </div>
    </article>
  );
}

export function ReceiptPrinter() {
  const [state, setState] = useState<"printed" | "printing" | "torn">("printed");
  const [audio, setAudio] = useState(false);
  const [count, setCount] = useState(1);
  const data = defaultReceipt;
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [paperHeight, setPaperHeight] = useState(510);
  const paperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const paper = paperRef.current?.querySelector("article");
    if (!paper) return;
    const observer = new ResizeObserver(() => setPaperHeight(paper.offsetHeight));
    observer.observe(paper);
    return () => observer.disconnect();
  }, [state]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    void audioContext.current?.close();
  }, []);

  function playSound(kind: "print" | "tear" | "toggle", enabled = audio) {
    if (!enabled) return;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      void context.resume();
      const duration = kind === "print" ? 2.2 : kind === "tear" ? 0.22 : 0.08;
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / context.sampleRate;
        data[i] = (Math.random() * 2 - 1) * (kind === "print" ? 0.35 + 0.3 * Math.sin(t * 150) : Math.exp(-t * 16));
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = kind === "print" ? 0.045 : 0.1;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(context.destination);
      source.start();
    } catch { /* Audio may be unavailable in the browser. */ }
  }

  function print() {
    if (state === "printing") return;
    setState("printing");
    playSound("print");
    timer.current = setTimeout(() => { setState("printed"); setCount((value) => value + 1); }, 2500);
  }

  async function download() {
    setExporting(true); setExportStatus("");
    try { await exportReceipt(data); setExportStatus("PDF downloaded · 80 mm receipt"); }
    catch { setExportStatus("Could not export. Please try again."); }
    finally { setExporting(false); }
  }

  return (
    <div className="studio-shell" style={{ "--brand-crimson": data.startColor, "--brand-burgundy": data.endColor, "--receipt-height": `${paperHeight}px` } as CSSProperties}>
      <header className="studio-header">
        <a href="/" className="studio-logo"><span className="logo-mark"><Printer size={19} strokeWidth={1.6} /></span><span>HST<span className="logo-light"> / bookings</span></span></a>
        <div className="header-status"><span className="status-dot" /> ALL SYSTEMS GOOD <span className="header-version">V.01</span></div>
      </header>

      <main className="workspace">
        <div className="workspace-heading"><span className="eyebrow">NEPAL | INDIA | BHUTAN | TIBET</span><h1>Himalayan Sync Treks</h1></div>
        <div className="printer-scene">
          <div className="scene-label scene-label-left"><span className="label-line" /><span>BOOKING CONFIRMATION</span><strong>Extraordinary trails.<br />Seamless journeys.</strong></div>
          <div className="printer-hardware">
            <div className="machine-top"><span className="machine-wordmark">HST<span className="wordmark-period">.</span></span><span className="machine-status"><span className={`status-dot ${state === "printing" ? "is-printing" : ""}`} />{state === "printing" ? "PRINTING" : "READY"}</span></div>
            <div className="machine-slot"><div className="slot-inner" /></div>
            <div className="machine-base"><span>THERMAL / 80 MM</span><span className="machine-lines">|||</span></div>
          </div>
          <div className={`paper-viewport ${state}`} key={state === "printing" ? `print-${count}` : "receipt"}>
            {state === "torn" && <div className="paper-stub" />}
            <div className="paper-motion" ref={paperRef}><Receipt data={data} /></div>
          </div>
          <div className="scene-label scene-label-right"><span className="label-line" /><span>BOOKING {booking.id}</span><strong>Your next adventure.<br />Confirmed on paper.</strong><span className="label-index">01 / 01</span></div>
          <div className="floor-shadow" />
        </div>

        <div className="control-area">
          <nav className="control-dock" aria-label="Receipt controls">
            <Button variant="ghost" className="dock-button" disabled={state === "printing"} onClick={print}><Printer size={17} /><span>{state === "printing" ? "PRINTING" : "RE-PRINT"}</span></Button>
            <span className="dock-divider" />
            <Button variant="ghost" className="dock-button" disabled={state !== "printed"} onClick={() => { setState("torn"); playSound("tear"); }}><Scissors size={17} /><span>TEAR</span></Button>
            <span className="dock-divider" />
            <Button variant="ghost" className={`dock-button ${audio ? "audio-on" : ""}`} aria-pressed={audio} onClick={() => { playSound("toggle", !audio); setAudio(!audio); }} title={audio ? "Mute printer sounds" : "Enable printer sounds"}>{audio ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>AUDIO</span><span className="audio-indicator" /></Button>
            <span className="dock-divider" />
            <Button variant="ghost" className="dock-button" disabled={exporting || state !== "printed"} onClick={download}>{exporting ? <LoaderCircle className="animate-spin" size={17} /> : <Download size={17} />}<span>{exporting ? "Exporting…" : "Export PDF"}</span></Button>
          </nav>
          <div className="print-status" role="status"><span className={`status-dot ${state === "printing" ? "is-printing" : ""}`} />{state === "printing" ? "Printing your confirmation" : state === "torn" ? "Confirmation torn. Re-print when ready." : "Your booking confirmation is ready"}</div>

          {exportStatus && <div className="export-status" role="status">{exportStatus}</div>}
        </div>
      </main>
      <footer className="studio-footer"><span>EXPLORE • EXPERIENCE • CONNECT</span><span>HIMALAYAN SYNC TREKS <span className="footer-spark">✳</span></span></footer>
    </div>
  );
}