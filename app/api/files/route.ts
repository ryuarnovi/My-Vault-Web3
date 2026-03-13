import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
        return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    try {
        const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from Pinata');
        }

        const data = await response.json();
        
        // We only care about the rows
        return NextResponse.json({ files: data.rows || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
