import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  employeeId?: string;
  employeeName?: string;
  organizationId: string;
}

interface QRCodeData {
  id: string;
  user_id: string;
  qr_code: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  used_at?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  employeeId, 
  employeeName,
  organizationId 
}) => {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadQRCodes = async () => {
    if (!employeeId) return;
    
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', employeeId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQRCodes(data || []);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    }
  };

  const generateQRCode = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      // Generate a unique QR code string
      const qrString = `mintid-qr-${employeeId}-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          user_id: employeeId,
          organization_id: organizationId,
          qr_code: qrString,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ QR Code Generated",
        description: "New QR code created with 30-day validity"
      });

      loadQRCodes();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCode: string) => {
    // Generate QR code as SVG for printing
    const qrSvg = generateQRCodeSVG(qrCode);
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${employeeName || 'employee'}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateQRCodeSVG = (data: string) => {
    // Simple QR code placeholder - in production, use a proper QR code library
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="30" y="30" width="140" height="140" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${data}</text>
      <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="10" fill="black">MinTid QR Login</text>
    </svg>`;
  };

  const deactivateQRCode = async (qrId: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: false })
        .eq('id', qrId);

      if (error) throw error;

      toast({
        title: "✅ QR Code Deactivated",
        description: "QR code has been disabled"
      });

      loadQRCodes();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to deactivate QR code",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, [employeeId, loadQRCodes]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            QR Codes for {employeeName || 'Employee'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateQRCode} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Generate New QR Code (30 days)
          </Button>

          <div className="space-y-3">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={qr.is_active ? 'default' : 'secondary'}>
                        {qr.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {qr.used_at && (
                        <Badge variant="outline">Used</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created: {new Date(qr.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expires: {new Date(qr.expires_at).toLocaleDateString()}
                      </div>
                      {qr.used_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Used: {new Date(qr.used_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(qr.qr_code)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {qr.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateQRCode(qr.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {qrCodes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📱</div>
                <p>No QR codes generated yet</p>
                <p className="text-sm">Generate a QR code for one-time employee login</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
