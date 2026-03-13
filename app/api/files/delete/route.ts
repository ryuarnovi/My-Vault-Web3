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
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT.trim()}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            
            // If it's already unpinned or not found, we consider it "deleted" for the user's purposes
            if (response.status === 404 || response.status === 400) {
                console.warn('⚠️ ASSET_NOT_FOUND_OR_ALREADY_UNPINNED:', cid);
                return NextResponse.json({ success: true, warning: 'ASSET_NOT_FOUND_REMOTE' });
            }

            console.error('❌ PINATA_UNPIN_ERROR:', response.status, errorText);
            throw new Error(`Pinata unpin failed (${response.status})`);
        }

        console.log(`✅ UNPIN_SUCCESSFUL: ${cid}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('❌ PINATA_UNPIN_TIMEOUT:', cid);
            return NextResponse.json({ error: 'API_TIMEOUT: PINATA_COMMUNICATION_HUNG' }, { status: 504 });
        }
        console.error('⚠️ UNPIN_INTERNAL_ERROR:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
