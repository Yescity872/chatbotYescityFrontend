import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cityName: string }> }
) {
    const { cityName } = await params;

    try {
        const db = await getDatabase();
        const collectionName = process.env.COLLECTION_NAME || "places";
        const collection = db.collection(collectionName);

        // Fetch all places for the city
        const places = await collection.find({
            city: { $regex: new RegExp(`^${cityName}$`, 'i') }
        }).toArray();

        // Group by category
        const groupedData: Record<string, any[]> = {};
        places.forEach(place => {
            const category = place.category || 'Uncategorized';
            if (!groupedData[category]) {
                groupedData[category] = [];
            }
            groupedData[category].push(place);
        });

        return NextResponse.json({ success: true, data: groupedData });
    } catch (error) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
