import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!'
  const firstName = 'System'
  const lastName = 'Admin'
  const organizationName = 'Platform Administration'

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(' Admin user already exists with this email')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: 'platform-admin',
          isActive: true,
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          firstName,
          lastName,
          emailVerified: true,
          status: 'ACTIVE',
        }
      })

      // Link user to organization as SYSTEM_ADMIN
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'SYSTEM_ADMIN'  // ← ADMIN ROLE
        }
      })

      return { user, organization }
    })

    console.log(' System Admin created successfully!')
    console.log(' Email:', result.user.email)
    console.log(' Password:', password)
    console.log(' Organization:', result.organization.name)
    console.log('\n IMPORTANT: Change the password after first login!')

  } catch (error) {
    console.error(' Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
