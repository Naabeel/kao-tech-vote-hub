
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
}

const QRCodeGenerator = ({ url, title }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [url]);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <canvas ref={canvasRef} className="border rounded-lg" />
        <p className="text-sm text-gray-600 text-center">
          Scan to access the voting platform
        </p>
        <p className="text-xs text-gray-500 break-all text-center">
          {url}
        </p>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
