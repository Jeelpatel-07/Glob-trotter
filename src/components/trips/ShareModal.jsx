import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function ShareModal({ isOpen, onClose, shareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Trip" size="sm">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.875rem' }}>
        Anyone with this link can view your trip itinerary and budget details.
      </p>
      <div className="share-url-box">
        <input type="text" value={shareUrl || ''} readOnly className="share-url-input" />
        <Button size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Modal>
  );
}
