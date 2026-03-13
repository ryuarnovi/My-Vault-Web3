import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const PINATA_JWT = process.env.PINATA_JWT;
        
        if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_here') {
            return NextResponse.json({ 
                error: 'Pinata API is not configured. Please add your real PINATA_JWT to the .env file.' 
            }, { status: 500 });
        }

        // Prepare Pinata upload
        const pinataData = new FormData();
        pinataData.append('file', file);
        
        const pinataMetadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                wallet: formData.get('wallet') || 'unknown',
                isEncrypted: formData.get('isEncrypted') || 'true'
            }
        });
        pinataData.append('pinataMetadata', pinataMetadata);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: pinataData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Pinata error: ${error}`);
        }

        const data = await response.json();
        
        return NextResponse.json({
            cid: data.IpfsHash,
            size: data.PinSize,
            timestamp: data.Timestamp
        });

    } catch (error: any) {
        console.error('IPFS Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
