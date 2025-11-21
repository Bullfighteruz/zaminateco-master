import React from 'react';
import { motion } from 'framer-motion';

interface QRGeneratorProps {
  data: string;
  size?: number;
  title?: string;
  className?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ 
  data, 
  size = 128, 
  title = "QR Code",
  className = ""
}) => {
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

  return (
    <motion.div
      className={`inline-block p-2 bg-white rounded-lg shadow-sm border ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img 
        src={qrCodeUrl}
        alt={title}
        width={size}
        height={size}
        className="rounded"
        loading="lazy"
      />
    </motion.div>
  );
};