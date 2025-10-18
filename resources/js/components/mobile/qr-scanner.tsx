import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CapacitorUtils } from '@/lib/capacitor-utils';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import jsQR from 'jsqr';
import { Camera as CameraIcon, Keyboard, X } from 'lucide-react';
import { useState } from 'react';

interface QRScannerProps {
    onScan: (code: string) => void;
    onClose?: () => void;
    title?: string;
    description?: string;
}

export function QRScanner({
    onScan,
    onClose,
    title,
    description,
}: QRScannerProps) {
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCameraScan = async () => {
        setScanning(true);
        setError(null);

        try {
            // Request camera permission and take photo
            const image = await Camera.getPhoto({
                quality: 100,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                width: 1024,
                height: 1024,
            });

            if (!image.dataUrl) {
                throw new Error('No image data received');
            }

            // Decode QR code from image
            const qrCode = await decodeQRFromDataUrl(image.dataUrl);

            if (qrCode) {
                await CapacitorUtils.hapticImpact('medium');
                onScan(qrCode);
            } else {
                setError(
                    'No QR code found in image. Please try again or enter code manually.',
                );
            }
        } catch (err) {
            console.error('QR scan error:', err);
            setError(
                'Failed to scan QR code. Please try again or enter code manually.',
            );
        } finally {
            setScanning(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScan(manualCode.trim());
        }
    };

    return (
        <Card className="border-0 shadow-xl">
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}

            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CameraIcon className="h-6 w-6 text-blue-500" />
                    {title || 'Scan QR Code'}
                </CardTitle>
                <CardDescription>
                    {description ||
                        'Use your camera to scan a partner QR code or enter it manually'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Camera Scan Button */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-4 border-dashed border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950">
                        <CameraIcon className="h-24 w-24 text-blue-400 dark:text-blue-600" />
                    </div>

                    <Button
                        size="lg"
                        onClick={handleCameraScan}
                        disabled={scanning}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                        <CameraIcon className="mr-2 h-5 w-5" />
                        {scanning ? 'Opening Camera...' : 'Scan with Camera'}
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                        {error}
                    </div>
                )}

                {/* Manual Entry */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 border-t pt-4">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            OR
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-3">
                        <div>
                            <Label
                                htmlFor="manual-code"
                                className="flex items-center gap-2"
                            >
                                <Keyboard className="h-4 w-4" />
                                Enter Code Manually
                            </Label>
                            <Input
                                id="manual-code"
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Enter partner code"
                                className="mt-1 font-mono"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                            disabled={!manualCode.trim()}
                        >
                            Submit Code
                        </Button>
                    </form>
                </div>

                {/* Help Text */}
                <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <p className="font-medium">Tips for scanning:</p>
                    <ul className="mt-2 ml-4 list-disc space-y-1">
                        <li>Ensure good lighting</li>
                        <li>Hold phone steady</li>
                        <li>Center QR code in frame</li>
                        <li>Avoid glare and shadows</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Decode QR code from a data URL
 */
async function decodeQRFromDataUrl(dataUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
            );
            resolve(code?.data || null);
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}
