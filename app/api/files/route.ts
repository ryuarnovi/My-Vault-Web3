import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const PINATA_JWT = process.env.PINATA_JWT;
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    
    if (!PINATA_JWT) {
        return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    try {
        const pinataUrl = new URL('https://api.pinata.cloud/data/pinList');
        pinataUrl.searchParams.append('status', 'pinned');
        pinataUrl.searchParams.append('pageLimit', '1000');

        if (wallet) {
            // Using official Pinata metadata query format (JSON stringified)
            const metadataQuery = JSON.stringify({
                keyvalues: {
                    wallet: {
                        value: wallet,
                        op: 'eq'
                    }
                }
            });
            pinataUrl.searchParams.append('metadata', metadataQuery);
        }

        console.log(`📡 CONNECTING_TO_PINATA: ${pinataUrl.toString()}`);

        const response = await fetch(pinataUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT.trim()}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ PINATA_GATEWAY_ERROR:', response.status, errorText);
            
            // Handle specific status codes
            if (response.status === 401) throw new Error('PINATA_AUTHENTICATION_FAILED: CHECK_JWT_SECRET');
            if (response.status === 403) throw new Error('PINATA_FORBIDDEN: ACCESS_DENIED');
            
            throw new Error(`PINATA_REMOTE_EXCEPTION (${response.status})`);
        }

        const data = await response.json();
        console.log(`✅ SYNC_SUCCESSFUL: ${data.rows?.length || 0} ASSETS_RETRIEVED`);
        
        return NextResponse.json({ files: data.rows || [] });
    } catch (error: any) {
        console.error('⚠️ VAULT_SYNC_INTERNAL_ERROR:', error.message);
        return NextResponse.json({ 
            error: error.message,
            code: 'API_COMMUNICATION_FAILURE' 
        }, { status: 500 });
    }
}
