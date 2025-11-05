// import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

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
      propertyId,
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
    if (!propertyId) missingFields.push('propertyId');

    if (missingFields.length > 0) {
      console.log('Validation failed: Missing required fields', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: String(propertyId) }
    });

    if (!property) {
      console.log('Validation failed: Property not found', { propertyId });
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 400 }
      );
    }

    // Validate user exists if provided
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: String(userId) }
      });
      if (!user) {
        console.log('Validation failed: User not found', { userId });
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400 }
        );
      }
    }

    // Safe type casting
    const numericOccupants = occupants ? Number(occupants) : null;
    const numericIncome = monthlyIncome ? parseFloat(monthlyIncome) : null;

    // Create application
    const newApplication = await prisma.tenantapplication.create({
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
        propertyId: String(propertyId),
        userId: userId ? String(userId) : null,
      },
      include: { property: true },
    });

    console.log('Tenant application created successfully', { id: newApplication.id });
    return NextResponse.json(
      { success: true, application: newApplication },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error saving tenant application:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const applications = await prisma.tenantapplication.findMany({
      include: {
        property: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}