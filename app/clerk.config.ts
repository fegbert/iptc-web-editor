import type { NuxtConfig } from '@nuxt/schema'

export const clerkConfig = {
  appearance: {
    variables: {
      colorPrimary: 'var(--color-primary)',
      colorBackground: 'var(--ui-bg)',
      colorText: 'var(--ui-text)',
      colorDanger: 'var(--color-error)',
      colorSuccess: 'var(--color-success)',
      colorWarning: 'var(--color-warning)',
      colorModalBackdrop: 'rgba(0, 0, 0, 0.5)',
    },
  },
  unsafe_disableDevelopmentModeConsoleWarning: true,
  localization: {
    organizationSwitcher: {
      action__createOrganization: 'Create Workspace',
      action__manageOrganization: 'Manage Workspace',
      notSelected: 'No Workspace selected',
      personalWorkspace: 'Personal Workspace',
    },
    createOrganization: {
      title: 'Create Workspace',
      formButtonSubmit: 'Create Workspace',
    },
    organizationProfile: {
      navbar: {
        title: 'Workspace',
        description: 'Manage your workspace settings and members.',
      },
      start: {
        profileSection: {
          title: 'Workspace Profile',
        },
      },
      profilePage: {
        title: 'Workspace Profile',
        successMessage: 'Workspace profile updated successfully.',
        dangerSection: {
          title: 'Danger Zone',
          deleteOrganization: {
            actionDescription: 'Please input the workspace name to confirm that you want to delete this workspace.',
            title: 'Delete Workspace',
            messageLine1: 'Are you sure you want to delete this workspace?',
            messageLine2: 'This action cannot be undone.',
            successMessage: 'The Workspace has been deleted successfully.',
          },
          leaveOrganization: {
            actionDescription: 'Please input the workspace name to confirm that you want to leave this workspace.',
            title: 'Leave Workspace',
            messageLine1: 'Are you sure you want to leave this workspace?',
            messageLine2: 'You will lose access to all of its data.',
            successMessage: 'You have left the Workspace successfully.',
          },
        },
      },
    },
    formFieldLabel__organizationName: 'Workspace name',
    formFieldInputPlaceholder__organizationName: 'Workspace name',
  },
} satisfies Partial<NuxtConfig['clerk']>
