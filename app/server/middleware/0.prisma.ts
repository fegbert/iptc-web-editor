declare module 'h3' {
  interface H3EventContext {
    prisma: ExtendedPrismaClient
  }
}

export default eventHandler((event) => {
  event.context.prisma = getPrisma()
})
