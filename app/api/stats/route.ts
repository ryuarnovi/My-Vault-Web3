import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
        return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    try {
        console.log('📡 FETCHING_PINATA_STORAGE_STATS...');
        
        const response = await fetch('https://api.pinata.cloud/data/userPinnedDataTotal', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT.trim()}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ PINATA_STATS_ERROR:', response.status, errorText);
            throw new Error(`PINATA_STATS_EXCEPTION (${response.status})`);
        }

        const data = await response.json();
        
        // Pinata Free Tier limit is 1GB (1,073,741,824 bytes)
        const totalLimit = 1073741824; 
        const usedBytes = parseInt(data.pin_size_total) || 0;
        const remainingBytes = Math.max(0, totalLimit - usedBytes);

        return NextResponse.json({
            used: usedBytes,
            remaining: remainingBytes,
            limit: totalLimit,
            count: data.pin_count,
            percentUsed: (usedBytes / totalLimit) * 100
        });

    } catch (error: any) {
        console.error('⚠️ STATS_INTERNAL_ERROR:', error.message);
        return NextResponse.json({ 
            error: error.message,
            code: 'STATS_FETCH_FAILURE' 
        }, { status: 500 });
    }
}
