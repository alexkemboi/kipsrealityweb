import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { 
  sendTenantApplicationNotification, 
  sendApplicationConfirmation 
} from "@/lib/mail-service";
import { encryptSSN } from '@/lib/encryption';

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

    // Fetch unit and include its property with manager details and listing status
    const unit = await prisma.unit.findUnique({
      where: { id: String(unitId).trim() },
      include: { 
        listing: {
          include: {
            status: true
          }
        }, // Include listing to check if unit is publicly available
        property: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
    });
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found', unitId }, { status: 400 });
    }
    if (!unit.property) {
      return NextResponse.json({ error: 'Property for this unit not found', unitId }, { status: 400 });
    }

    // Check if unit has an active listing - applications only allowed for listed units
      if (!unit.listing) {
        return NextResponse.json({ 
          error: 'This unit is not currently available for applications. Only units with active marketplace listings accept applications.',
          code: 'UNIT_NOT_LISTED',
          unitId 
        }, { status: 403 });
      }
      const listingStatusName = unit.listing.status?.name as string;
      if (listingStatusName && !["ACTIVE", "COMING_SOON"].includes(listingStatusName)) {
        return NextResponse.json({
          error: 'This unit is not currently available for applications.',
          code: 'UNIT_NOT_AVAILABLE',
          unitId
        }, { status: 403 });
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

    // Encrypt SSN if provided
    let ssnEncrypted = null;
    if (ssn && typeof ssn === 'string' && ssn.trim()) {
      try {
        ssnEncrypted = encryptSSN(ssn.trim());
      } catch (encryptionError) {
        console.error('Failed to encrypt SSN:', encryptionError);
        return NextResponse.json(
          { error: 'Failed to encrypt SSN data', details: 'Encryption error' },
          { status: 500 }
        );
      }
    }

    // Create tenant application
    const newApplication = await prisma.tenantapplication.create({
      data: {
        fullName,
        email,
        phone,
        dob: new Date(dob),
        ssn: null, // Do not store plaintext SSN
        ssnEncrypted, // Store encrypted SSN
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
      include: { 
        property: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }, 
        unit: true, 
        user: true 
      },
    });

    // Send notification email to property manager
    if (unit.property.manager?.user?.email) {
      try {
        const managerEmail = unit.property.manager.user.email;
        const managerName = unit.property.manager.user.firstName || 'Property Manager';
        const propertyName = unit.property.name || unit.property.city || 'Unknown Property';
        const unitNumber = unit.unitNumber || 'N/A';
        const moveInDateStr = new Date(moveInDate);
        
        await sendTenantApplicationNotification(
          managerEmail,
          managerName,
          fullName,
          email,
          phone,
          propertyName,
          unitNumber,
          moveInDateStr,
          leaseType
        );
        
        console.log(`📧 Notification email sent to property manager: ${managerEmail}`);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the application submission if email fails
      }
    } else {
      console.warn('No property manager email found for notification');
    }

    // Send confirmation email to applicant
    try {
      const propertyName = unit.property.name || unit.property.city || 'Unknown Property';
      const unitNumber = unit.unitNumber || 'N/A';
      
      await sendApplicationConfirmation(
        email,
        fullName,
        propertyName,
        unitNumber
      );
      
      console.log(`📧 Application confirmation email sent to applicant: ${email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the application submission if email fails
    }

    return NextResponse.json({ success: true, application: newApplication }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error saving tenant application:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

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

    const where: Prisma.TenantapplicationWhereInput = {
      property: {
        manager: {
          userId: user.id
        }
      }
    };
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const applications = await prisma.tenantapplication.findMany({
      where,
      include: {
        property: true,
        unit: true,
        user: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(applications, { status: 200 });

  } catch (error: unknown) {
    console.error("Error fetching applications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
