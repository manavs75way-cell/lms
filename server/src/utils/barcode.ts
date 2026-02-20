import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';


export const generateBarcode = async (text: string, filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const barcodeDir = path.join(process.cwd(), 'public', 'barcodes');
        if (!fs.existsSync(barcodeDir)) {
            fs.mkdirSync(barcodeDir, { recursive: true });
        }

        const filePath = path.join(barcodeDir, `${filename}.png`);

        bwipjs.toBuffer(
            {
                bcid: 'code128',
                text: text,
                scale: 3,
                height: 10,
                includetext: true,
                textxalign: 'center',
            },
            (err, png) => {
                if (err) {
                    reject(err);
                } else {
                    fs.writeFile(filePath, png, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(`/public/barcodes/${filename}.png`);
                        }
                    });
                }
            }
        );
    });
};

export const generateQRCode = async (url: string, filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const qrDir = path.join(process.cwd(), 'public', 'qrcodes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        const filePath = path.join(qrDir, `${filename}.png`);

        bwipjs.toBuffer(
            {
                bcid: 'qrcode',
                text: url,
                scale: 5,
                height: 30,
                width: 30,
            },
            (err, png) => {
                if (err) {
                    reject(err);
                } else {
                    fs.writeFile(filePath, png, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(`/public/qrcodes/${filename}.png`);
                        }
                    });
                }
            }
        );
    });
};


export const generateBothCodes = async (
    copyCode: string,
    copyId: string,
    baseUrl: string = 'http://localhost:5173'
): Promise<{ barcodeUrl: string; qrCodeUrl: string }> => {
    const barcodeUrl = await generateBarcode(copyCode, `copy-${copyCode}`);
    const deepLink = `${baseUrl}/copies/${copyId}`;
    const qrCodeUrl = await generateQRCode(deepLink, `copy-qr-${copyCode}`);
    return { barcodeUrl, qrCodeUrl };
};
