import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from "@/lib/Getcurrentuser";
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      fullName,
      email,
      phone,
      dob,
      ssn,
      address,
      employerName,
      jobTitle,
      monthlyIncome,
      employmentDuration,
      leaseType,
      occupancyType,
      moveInDate,
      leaseDuration,
      occupants,
      pets,
      landlordName,
      landlordContact,
      reasonForMoving,
      referenceName,
      referenceContact,
      consent,
      unitId,   // now required
      userId,
    } = data;

    // Validate required fields
    const missingFields: string[] = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!dob) missingFields.push('dob');
    if (!leaseType) missingFields.push('leaseType');
    if (!occupancyType) missingFields.push('occupancyType');
    if (!moveInDate) missingFields.push('moveInDate');
    if (!leaseDuration) missingFields.push('leaseDuration');
    if (!unitId) missingFields.push('unitId');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch unit and include its property
    const unit = await prisma.unit.findUnique({
      where: { id: String(unitId).trim() },
      include: { property: true },
    });
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found', unitId }, { status: 400 });
    }
    if (!unit.property) {
      return NextResponse.json({ error: 'Property for this unit not found', unitId }, { status: 400 });
    }

    // Validate user if provided
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: String(userId).trim() } });
      if (!user) return NextResponse.json({ error: 'User not found', userId }, { status: 400 });
    }

    // Safe type casting
    const numericOccupants = occupants ? Number(occupants) : null;
    const numericIncome = monthlyIncome ? parseFloat(monthlyIncome) : null;

    // Create tenant application
    const newApplication = await prisma.tenantApplication.create({
      data: {
        fullName,
        email,
        phone,
        dob: new Date(dob),
        ssn: ssn || null,
        address: address || null,
        employerName: employerName || null,
        jobTitle: jobTitle || null,
        monthlyIncome: numericIncome,
        employmentDuration: employmentDuration || null,
        leaseType,
        occupancyType,
        moveInDate: new Date(moveInDate),
        leaseDuration,
        occupants: numericOccupants,
        pets: pets || null,
        landlordName: landlordName || null,
        landlordContact: landlordContact || null,
        reasonForMoving: reasonForMoving || null,
        referenceName: referenceName || null,
        referenceContact: referenceContact || null,
        consent: !!consent,
        unitId: unit.id,
        propertyId: unit.property.id,
        userId: user?.id || null,
      },
      include: { property: true, unit: true, user: true },
    });

    return NextResponse.json({ success: true, application: newApplication }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving tenant application:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Support filtering by propertyId if provided
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");

    const where: any = {
      property: {
        manager: {
          userId: user.id
        }
      }
    };
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const applications = await prisma.tenantApplication.findMany({
      where,
      include: {
        property: true,
        unit: true,
        user: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(applications, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
