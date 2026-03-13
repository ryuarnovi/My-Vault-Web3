import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { cid } = await req.json();
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
        return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    if (!cid) {
        return NextResponse.json({ error: 'CID is required' }, { status: 400 });
    }

    try {
        console.log(`🗑️ UNPINNING_FROM_PINATA: ${cid}`);
        
        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT.trim()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ PINATA_UNPIN_ERROR:', response.status, errorText);
            throw new Error(`Pinata unpin failed (${response.status})`);
        }

        console.log(`✅ UNPIN_SUCCESSFUL: ${cid}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('⚠️ UNPIN_INTERNAL_ERROR:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
