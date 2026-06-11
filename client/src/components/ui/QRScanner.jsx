import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const qrcodeRegionId = 'html5qr-code-full-region';

const QRScanner = ({ fps = 10, qrbox = 250, aspectRatio = 1.0, disableFlip = false, onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Configuration for the scanner
    const config = { fps, qrbox, aspectRatio, disableFlip };

    // Initialize the scanner
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      
      scannerRef.current.render(
        (decodedText, decodedResult) => {
          if (onScanSuccess) {
            onScanSuccess(decodedText, decodedResult);
          }
        },
        (errorMessage) => {
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );
    }

    // Cleanup when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear html5QrcodeScanner. ', error);
        });
        scannerRef.current = null;
      }
    };
  }, [fps, qrbox, aspectRatio, disableFlip, onScanSuccess, onScanFailure]);

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div id={qrcodeRegionId} className="w-full border-none [&_video]:w-full [&_video]:object-cover" />
      <style>{`
        #html5qr-code-full-region {
          border: none !important;
        }
        #html5qr-code-full-region button {
          background-color: #6366f1;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin: 8px 4px;
        }
        #html5qr-code-full-region select {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          margin-bottom: 8px;
          background: white;
        }
        #html5qr-code-full-region a {
          display: none !important;
        }
        #html5qr-code-full-region__scan_region {
           min-height: 250px;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
