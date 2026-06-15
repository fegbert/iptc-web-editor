export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const { user, isLoaded, isSignedIn } = useUser()

  await until(isLoaded).toBe(true)

  if (!isSignedIn.value) {
    return navigateTo('/')
  }

  const memberships = user.value?.organizationMemberships ?? []

  const orgIdOrSlug = to.params.orgId as string

  const isMemberOfOrg = memberships.some((membership) => {
    const org = membership.organization
    return org.id === orgIdOrSlug || org.slug === orgIdOrSlug
  })

  if (!isMemberOfOrg) {
    return navigateTo('/')
  }
})
