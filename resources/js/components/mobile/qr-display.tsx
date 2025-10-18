import { CapacitorUtils } from '@/lib/capacitor-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

interface QRDisplayProps {
    value: string;
    title?: string;
    description?: string;
    size?: number;
    showDownload?: boolean;
    showShare?: boolean;
}

export function QRDisplay({
    value,
    title,
    description,
    size = 256,
    showDownload = true,
    showShare = true,
}: QRDisplayProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        try {
            const canvas = qrRef.current?.querySelector('canvas');
            if (!canvas) return;

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `trackly-qr-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            await CapacitorUtils.hapticImpact('light');
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    const handleShare = async () => {
        try {
            const canvas = qrRef.current?.querySelector('canvas');
            if (!canvas) return;

            const dataUrl = canvas.toDataURL('image/png');

            // Convert data URL to blob for sharing
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'trackly-qr.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: title || 'Trackly QR Code',
                    text: description || 'Scan this QR code to refer customers',
                    files: [file],
                });
            } else {
                // Fallback to Capacitor share
                await CapacitorUtils.share({
                    title: title || 'Trackly QR Code',
                    text: description || 'Scan this QR code to refer customers',
                    url: window.location.href,
                });
            }

            await CapacitorUtils.hapticImpact('light');
        } catch (error) {
            console.error('Error sharing QR code:', error);
        }
    };

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle>{title || 'Your QR Code'}</CardTitle>
                {description && <CardDescription className="text-white/80">{description}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
                {/* QR Code Display */}
                <div className="flex justify-center">
                    <div
                        ref={qrRef}
                        className="rounded-2xl bg-white p-6 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900"
                    >
                        <QRCodeCanvas
                            value={value}
                            size={size}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                </div>

                {/* Value Display */}
                <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">QR Code Value</p>
                    <p className="mt-1 break-all font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    {showDownload && (
                        <Button variant="outline" onClick={handleDownload} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}
                    {showShare && (
                        <Button
                            onClick={handleShare}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    )}
                </div>

                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950">
                    <p className="font-medium text-blue-900 dark:text-blue-100">How to use:</p>
                    <ul className="ml-4 mt-2 list-disc space-y-1 text-blue-800 dark:text-blue-200">
                        <li>Share this QR code with customers</li>
                        <li>They scan it to book services</li>
                        <li>You earn commission on bookings</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
