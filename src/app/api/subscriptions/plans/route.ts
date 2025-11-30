import { NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/lib/plan-limits";

export async function GET() {
    try {
        // Convert the PLAN_LIMITS object to an array for the frontend
        const plans = Object.entries(PLAN_LIMITS).map(([key, value]) => ({
            id: key,
            ...value,
        }));

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
