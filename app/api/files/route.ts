import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
        return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    try {
        console.log('Fetching files from Pinata...');
        const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata API error:', response.status, errorText);
            throw new Error(`Pinata error (${response.status}): ${errorText || 'Failed to fetch'}`);
        }

        const data = await response.json();
        console.log(`Successfully fetched ${data.rows?.length || 0} files from Pinata.`);
        
        return NextResponse.json({ files: data.rows || [] });
    } catch (error: any) {
        console.error('API Route Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
