export const en = {
  shell: {
    brand: 'Dash',
    title: 'Runtime shell',
    header: 'Header',
    tagline: 'Simple app shell',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
  },
  nav: {
    groupShell: 'Shell',
    groupModule: 'Module',
    hostHome: 'Host home',
    hostHomeDesc: 'Shell-owned page.',
    remoteModule: 'Remote module',
    remoteModuleDesc: 'Mounts the remote module.',
  },
  host: {
    title: 'Host page',
    description: 'Shell-owned content. This page lives only in the host app.',
    owner: 'Owner',
    ownerValue: 'Shell',
    ownerDesc: 'Rendered by runtime-mf-shell.',
    role: 'Role',
    roleValue: 'Host home',
    roleDesc: 'One shell tab / one shell path.',
    crashTitle: 'Shell crash test',
    crashDesc:
      'Throws in the shell React tree. You should see ShellErrorBoundary (full page), not the remote slot fallback.',
    crashButton: 'Crash shell render',
  },
  remote: {
    loading: 'Loading remote...',
    failedTitle: 'Remote failed to load',
    slotCrashedTitle: 'Remote slot crashed',
    unavailableTitle: 'Remote module unavailable',
    unavailableDesc:
      'The shell stayed up. This slot failed to load or render the remote module.',
    retry: 'Retry',
  },
  shellError: {
    title: 'Something went wrong in the shell',
    description:
      'The host app hit a render error. Retry to remount the shell UI.',
    label: 'Shell error',
    retry: 'Retry',
  },
} as const;
