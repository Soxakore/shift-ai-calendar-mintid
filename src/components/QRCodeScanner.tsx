
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, Clock, MapPin } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import dataStore, { TimeLog } from '@/lib/dataStore';

interface QRCodeScannerProps {
  trigger?: React.ReactNode;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<TimeLog | null>(null);
  
  const { user, profile } = useSupabaseAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleQRScan = async (qrCode: string) => {
    if (!user || !qrCode.trim()) return;

    setIsScanning(true);
    try {
      const timeLog = dataStore.scanQRCode(qrCode.trim(), user.id);
      
      if (timeLog) {
        const isClockIn = !!timeLog.clockIn && !timeLog.clockOut;
        const isClockOut = !!timeLog.clockIn && !!timeLog.clockOut;
        
        setLastScan(timeLog);
        
        toast({
          title: isClockOut ? t('clockOut') : t('clockIn'),
          description: `Successfully ${isClockOut ? 'clocked out' : 'clocked in'} at ${timeLog.location}`,
        });
        
        setQrInput('');
      } else {
        toast({
          title: t('error'),
          description: "Invalid QR code or QR code not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to process QR code",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualInput = () => {
    handleQRScan(qrInput);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  const defaultTrigger = (
    <Button className="w-full">
      <QrCode className="w-4 h-4 mr-2" />
      {t('scanQR')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-500" />
            {t('qrTimeLogging')}
          </DialogTitle>
          <DialogDescription>
            Scan or enter a QR code to log your time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* QR Code Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">QR Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="qr-input"
                  placeholder="Enter QR code or scan..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                />
                <Button 
                  onClick={handleManualInput}
                  disabled={isScanning || !qrInput.trim()}
                  size="sm"
                >
                  {isScanning ? t('loading') : 'Scan'}
                </Button>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Or use your phone's camera to scan the QR code
            </div>
          </div>

          {/* Camera Placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Camera functionality would be here</p>
            <p className="text-xs text-gray-400 mt-1">For demo purposes, use manual input above</p>
          </div>

          {/* Last Scan Result */}
          {lastScan && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Time Logged Successfully</span>
              </div>
              <div className="space-y-1 text-sm">
                {lastScan.clockIn && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Clock In</Badge>
                    <span>{formatTime(lastScan.clockIn)}</span>
                  </div>
                )}
                {lastScan.clockOut && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Clock Out</Badge>
                    <span>{formatTime(lastScan.clockOut)}</span>
                  </div>
                )}
                {lastScan.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-gray-600">{lastScan.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available QR Codes for Demo */}
          {profile?.organization_id && (
            <div className="space-y-2">
              <Label>Available QR Codes (Demo)</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrInput('QR_MC_KITCHEN_001')}
                  className="justify-start text-left"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Kitchen Entrance - QR_MC_KITCHEN_001
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrInput('QR_MC_COUNTER_001')}
                  className="justify-start text-left"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Front Counter - QR_MC_COUNTER_001
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
