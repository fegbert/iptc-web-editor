import type { OrgRole } from '../types'
import { TRPCError } from '@trpc/server'
import { t } from './init'

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
}

export function hasRole(userRole: OrgRole, requiredRole: OrgRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

const isSignedInMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.isAuthenticated) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User must be signed in to access this resource.' })
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        ...ctx.auth,
        userId: ctx.auth.userId!,
      },
    },
  })
})

export const protectedProcedure = t.procedure.use(isSignedInMiddleware)

export function makeRoleCheckedProcedure(role: OrgRole) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.auth.orgId || !ctx.auth.orgRole) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User must be a member of an organization to access this resource.' })
    }

    const userRole = ctx.auth.orgRole as OrgRole
    if (!hasRole(userRole, role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: `User must have at least ${role} role to access this resource.` })
    }

    return next({
      ctx: {
        ...ctx,
        auth: {
          ...ctx.auth,
          orgId: ctx.auth.orgId!,
          orgRole: userRole,
        },
      },
    })
  })
}
