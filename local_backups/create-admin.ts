import { PrismaClient, Prisma, UserStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function createAdmin() {
  const email = requireEnv('ADMIN_EMAIL').toLowerCase()
  const password = requireEnv('ADMIN_PASSWORD')

  if (!email.includes('@')) {
    throw new Error('ADMIN_EMAIL must be a valid email address.')
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.')
  }

  const firstName = 'System'
  const lastName = 'Admin'
  const organizationName = 'Platform Administration'
  const organizationSlug = 'platform-admin'
  const now = new Date()

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.upsert({
        where: { slug: organizationSlug },
        update: {
          name: organizationName,
          isActive: true,
        },
        create: {
          name: organizationName,
          slug: organizationSlug,
          isActive: true,
        },
      })

      const user = await tx.user.upsert({
        where: { email },
        update: {
          firstName,
          lastName,
          emailVerified: now, // DateTime? in schema
          status: UserStatus.ACTIVE,
          // passwordHash: hashedPassword, // enable only if you want reruns to reset password
        },
        create: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          emailVerified: now, // DateTime? in schema
          status: UserStatus.ACTIVE,
        },
      })

      await tx.organizationUser.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: organization.id,
          },
        },
        update: {
          role: UserRole.SYSTEM_ADMIN,
        },
        create: {
          userId: user.id,
          organizationId: organization.id,
          role: UserRole.SYSTEM_ADMIN,
        },
      })

      return { user, organization }
    })

    console.log('✅ System Admin is ready')
    console.log(`Email: ${result.user.email}`)
    console.log(`Organization: ${result.organization.name}`)
    console.log('⚠️ Password was set from ADMIN_PASSWORD (not shown for security).')
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`❌ Prisma error (${error.code}):`, error.message)
    } else if (error instanceof Error) {
      console.error('❌ Error creating admin:', error.message)
    } else {
      console.error('❌ Unknown error creating admin:', error)
    }
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
