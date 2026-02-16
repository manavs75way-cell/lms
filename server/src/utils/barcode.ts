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
